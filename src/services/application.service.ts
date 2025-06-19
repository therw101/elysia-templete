import { sql } from './database.service';
import { jobService } from './job.service';

export interface CreateApplicationData {
  jobId: string;
  studentId: string;
  coverLetter?: string;
}

export interface UpdateApplicationData {
  coverLetter?: string;
  status?: string;
  reviewerNotes?: string;
}

export interface ApplicationQuery {
  limit?: number;
  offset?: number;
  status?: string;
  jobId?: string;
  studentId?: string;
  employerId?: string;
}

export class ApplicationService {
  /**
   * สร้างใบสมัครงานใหม่
   */
  async createApplication(applicationData: CreateApplicationData) {
    try {
      // ตรวจสอบว่าสามารถสมัครได้หรือไม่
      const canApplyResult = await jobService.canApplyForJob(
        applicationData.jobId, 
        applicationData.studentId
      );
      
      if (!canApplyResult.canApply) {
        throw new Error(canApplyResult.reason);
      }

      const result = await sql`
        INSERT INTO applications (job_id, student_id, cover_letter)
        VALUES (${applicationData.jobId}, ${applicationData.studentId}, ${applicationData.coverLetter})
        RETURNING id, job_id, student_id, cover_letter, status, applied_at, created_at, updated_at
      `;

      // อัพเดทจำนวนการสมัครในตาราง jobs
      await jobService.updateApplicationCount(applicationData.jobId);

      return result[0];
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการใบสมัครตามเงื่อนไข
   */
  async getApplications(query: ApplicationQuery = {}) {
    try {
      const { limit = 10, offset = 0, status, jobId, studentId, employerId } = query;
      
      let whereConditions = [];
      
      if (status) {
        whereConditions.push(`a.status = '${status}'`);
      }
      
      if (jobId) {
        whereConditions.push(`a.job_id = '${jobId}'`);
      }
      
      if (studentId) {
        whereConditions.push(`a.student_id = '${studentId}'`);
      }
      
      if (employerId) {
        whereConditions.push(`j.employer_id = '${employerId}'`);
      }
      
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ') 
        : '';
      
      const applications = await sql.unsafe(`
        SELECT a.id, a.job_id, a.student_id, a.cover_letter, a.status,
               a.applied_at, a.reviewed_at, a.reviewer_notes, a.created_at, a.updated_at,
               j.title as job_title, j.location as job_location, j.salary_min, j.salary_max,
               s.username as student_username, s.first_name as student_first_name, 
               s.last_name as student_last_name, s.email as student_email,
               sp.student_id as student_number, sp.major, sp.faculty, sp.year_of_study,
               emp.username as employer_username,
               ep.company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users s ON a.student_id = s.id
        LEFT JOIN student_profiles sp ON s.id = sp.user_id
        JOIN users emp ON j.employer_id = emp.id
        LEFT JOIN employer_profiles ep ON emp.id = ep.user_id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      
      const totalResult = await sql.unsafe(`
        SELECT COUNT(*) as total 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        ${whereClause}
      `);
      
      return { 
        applications, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting applications:', error);
      throw error;
    }
  }

  /**
   * ดึงใบสมัครจาก ID
   */
  async getApplicationById(id: string) {
    try {
      const result = await sql`
        SELECT a.*, 
               j.title as job_title, j.description as job_description, 
               j.location as job_location, j.salary_min, j.salary_max,
               j.work_type, j.duration,
               s.username as student_username, s.first_name as student_first_name, 
               s.last_name as student_last_name, s.email as student_email,
               s.phone_number as student_phone,
               sp.student_id as student_number, sp.major, sp.faculty, 
               sp.year_of_study, sp.gpa, sp.skills, sp.bio, sp.resume_url,
               emp.username as employer_username,
               ep.company_name, ep.contact_person
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users s ON a.student_id = s.id
        LEFT JOIN student_profiles sp ON s.id = sp.user_id
        JOIN users emp ON j.employer_id = emp.id
        LEFT JOIN employer_profiles ep ON emp.id = ep.user_id
        WHERE a.id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error getting application by ID:', error);
      throw error;
    }
  }

  /**
   * อัพเดทใบสมัคร
   */
  async updateApplication(id: string, applicationData: UpdateApplicationData) {
    try {
      const fields = [];
      const values = [];
      
      if (applicationData.coverLetter) {
        fields.push('cover_letter = $' + (fields.length + 1));
        values.push(applicationData.coverLetter);
      }
      
      if (applicationData.status) {
        fields.push('status = $' + (fields.length + 1));
        values.push(applicationData.status);
        
        // ถ้าเป็นการ review ให้ตั้งค่า reviewed_at
        if (applicationData.status !== 'PENDING') {
          fields.push('reviewed_at = CURRENT_TIMESTAMP');
        }
      }
      
      if (applicationData.reviewerNotes) {
        fields.push('reviewer_notes = $' + (fields.length + 1));
        values.push(applicationData.reviewerNotes);
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      // เพิ่ม id ใน values array
      values.push(id);
      
      const query = `
        UPDATE applications 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING id, job_id, student_id, cover_letter, status, applied_at,
                 reviewed_at, reviewer_notes, created_at, updated_at
      `;
      
      const result = await sql.unsafe(query, values);
      return result[0];
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  /**
   * ลบใบสมัคร
   */
  async deleteApplication(id: string) {
    try {
      // ดึงข้อมูล job_id ก่อนลบ เพื่ออัพเดท count
      const applicationInfo = await sql`
        SELECT job_id FROM applications WHERE id = ${id}
      `;
      
      if (!applicationInfo[0]) {
        throw new Error('Application not found');
      }
      
      const result = await sql`
        DELETE FROM applications 
        WHERE id = ${id}
        RETURNING id
      `;
      
      // อัพเดทจำนวนการสมัครในตาราง jobs
      await jobService.updateApplicationCount(applicationInfo[0].job_id);
      
      return result[0];
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  /**
   * ดึงใบสมัครของนักศึกษา
   */
  async getApplicationsByStudent(studentId: string, options: { limit?: number; offset?: number } = {}) {
    try {
      const { limit = 10, offset = 0 } = options;
      
      const applications = await sql`
        SELECT a.id, a.job_id, a.cover_letter, a.status, a.applied_at, a.reviewed_at,
               j.title as job_title, j.location as job_location, j.salary_min, j.salary_max,
               j.work_type, j.application_deadline, j.status as job_status,
               ep.company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users emp ON j.employer_id = emp.id
        LEFT JOIN employer_profiles ep ON emp.id = ep.user_id
        WHERE a.student_id = ${studentId}
        ORDER BY a.applied_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const totalResult = await sql`
        SELECT COUNT(*) as total FROM applications WHERE student_id = ${studentId}
      `;
      
      return { 
        applications, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting applications by student:', error);
      throw error;
    }
  }

  /**
   * ดึงใบสมัครสำหรับงานของ employer
   */
  async getApplicationsByEmployer(employerId: string, options: { limit?: number; offset?: number; status?: string } = {}) {
    try {
      const { limit = 10, offset = 0, status } = options;
      
      let whereClause = 'WHERE j.employer_id = $1';
      const params = [employerId];
      
      if (status) {
        whereClause += ' AND a.status = $2';
        params.push(status);
      }
      
      const applications = await sql.unsafe(`
        SELECT a.id, a.job_id, a.student_id, a.cover_letter, a.status, 
               a.applied_at, a.reviewed_at, a.reviewer_notes,
               j.title as job_title,
               s.username as student_username, s.first_name as student_first_name, 
               s.last_name as student_last_name, s.email as student_email,
               sp.student_id as student_number, sp.major, sp.faculty, sp.year_of_study
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users s ON a.student_id = s.id
        LEFT JOIN student_profiles sp ON s.id = sp.user_id
        ${whereClause}
        ORDER BY a.applied_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, params);
      
      const totalParams = status ? [employerId, status] : [employerId];
      const totalResult = await sql.unsafe(`
        SELECT COUNT(*) as total 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        ${whereClause}
      `, totalParams);
      
      return { 
        applications, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting applications by employer:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่านักศึกษาได้สมัครงานนี้แล้วหรือไม่
   */
  async hasStudentApplied(jobId: string, studentId: string) {
    try {
      const result = await sql`
        SELECT id FROM applications 
        WHERE job_id = ${jobId} AND student_id = ${studentId}
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if student has applied:', error);
      throw error;
    }
  }

  /**
   * ดึงสถิติการสมัครงาน
   */
  async getApplicationStats(employerId?: string) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'REVIEWED' THEN 1 END) as reviewed_count,
          COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_count,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN status = 'WITHDRAWN' THEN 1 END) as withdrawn_count
        FROM applications a
      `;
      
      if (employerId) {
        query += ` JOIN jobs j ON a.job_id = j.id WHERE j.employer_id = '${employerId}'`;
      }
      
      const result = await sql.unsafe(query);
      return result[0];
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  }

  /**
   * อัพเดทสถานะใบสมัครหลายใบพร้อมกัน
   */
  async bulkUpdateApplicationStatus(applicationIds: string[], status: string, reviewerNotes?: string) {
    try {
      const result = await sql`
        UPDATE applications 
        SET status = ${status}, 
            reviewed_at = CURRENT_TIMESTAMP,
            reviewer_notes = ${reviewerNotes || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY(${applicationIds})
        RETURNING id, status
      `;
      return result;
    } catch (error) {
      console.error('Error bulk updating application status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const applicationService = new ApplicationService(); 