import { sql } from './database.service';

export interface CreateJobData {
  employerId: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  workType?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  applicationDeadline?: Date;
  maxApplications?: number;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  workType?: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  applicationDeadline?: Date;
  maxApplications?: number;
  status?: string;
}

export interface JobQuery {
  limit?: number;
  offset?: number;
  status?: string;
  workType?: string;
  employerId?: string;
  search?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export class JobService {
  /**
   * สร้างงานใหม่
   */
  async createJob(jobData: CreateJobData) {
    try {
      const result = await sql`
        INSERT INTO jobs (
          employer_id, title, description, requirements, location,
          salary_min, salary_max, currency, work_type, duration,
          start_date, end_date, application_deadline, max_applications
        ) VALUES (
          ${jobData.employerId}, ${jobData.title}, ${jobData.description},
          ${jobData.requirements}, ${jobData.location}, ${jobData.salaryMin},
          ${jobData.salaryMax}, ${jobData.currency || 'THB'}, ${jobData.workType},
          ${jobData.duration}, ${jobData.startDate}, ${jobData.endDate},
          ${jobData.applicationDeadline}, ${jobData.maxApplications}
        )
        RETURNING id, employer_id, title, description, requirements, location,
                 salary_min, salary_max, currency, work_type, duration,
                 start_date, end_date, application_deadline, max_applications,
                 status, views_count, applications_count, created_at, updated_at
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการงานตามเงื่อนไข
   */
  async getJobs(query: JobQuery = {}) {
    try {
      const { 
        limit = 10, 
        offset = 0, 
        status = 'PUBLISHED', 
        workType, 
        employerId, 
        search,
        salaryMin,
        salaryMax 
      } = query;
      
      let whereConditions = [`j.status = ${status}`];
      
      if (workType) {
        whereConditions.push(`j.work_type = ${workType}`);
      }
      
      if (employerId) {
        whereConditions.push(`j.employer_id = ${employerId}`);
      }
      
      if (search) {
        whereConditions.push(`(j.title ILIKE ${'%' + search + '%'} OR j.description ILIKE ${'%' + search + '%'})`);
      }
      
      if (salaryMin) {
        whereConditions.push(`j.salary_min >= ${salaryMin}`);
      }
      
      if (salaryMax) {
        whereConditions.push(`j.salary_max <= ${salaryMax}`);
      }
      
      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      
      const jobs = await sql.unsafe(`
        SELECT j.id, j.title, j.description, j.location, j.salary_min, j.salary_max,
               j.currency, j.work_type, j.duration, j.application_deadline, j.status,
               j.views_count, j.applications_count, j.created_at,
               u.username as employer_username,
               ep.company_name
        FROM jobs j
        JOIN users u ON j.employer_id = u.id
        LEFT JOIN employer_profiles ep ON u.id = ep.user_id
        ${whereClause}
        ORDER BY j.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      
      const totalResult = await sql.unsafe(`
        SELECT COUNT(*) as total 
        FROM jobs j
        JOIN users u ON j.employer_id = u.id
        LEFT JOIN employer_profiles ep ON u.id = ep.user_id
        ${whereClause}
      `);
      
      return { 
        jobs, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  /**
   * ดึงงานจาก ID
   */
  async getJobById(id: string) {
    try {
      const result = await sql`
        SELECT j.*, 
               u.username as employer_username, 
               u.email as employer_email,
               ep.company_name, ep.company_description, ep.contact_person
        FROM jobs j
        JOIN users u ON j.employer_id = u.id
        LEFT JOIN employer_profiles ep ON u.id = ep.user_id
        WHERE j.id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  }

  /**
   * อัพเดทงาน
   */
  async updateJob(id: string, jobData: UpdateJobData) {
    try {
      const fields = [];
      const values = [];
      
      if (jobData.title) {
        fields.push('title = $' + (fields.length + 1));
        values.push(jobData.title);
      }
      if (jobData.description) {
        fields.push('description = $' + (fields.length + 1));
        values.push(jobData.description);
      }
      if (jobData.requirements) {
        fields.push('requirements = $' + (fields.length + 1));
        values.push(jobData.requirements);
      }
      if (jobData.location) {
        fields.push('location = $' + (fields.length + 1));
        values.push(jobData.location);
      }
      if (jobData.salaryMin !== undefined) {
        fields.push('salary_min = $' + (fields.length + 1));
        values.push(jobData.salaryMin);
      }
      if (jobData.salaryMax !== undefined) {
        fields.push('salary_max = $' + (fields.length + 1));
        values.push(jobData.salaryMax);
      }
      if (jobData.workType) {
        fields.push('work_type = $' + (fields.length + 1));
        values.push(jobData.workType);
      }
      if (jobData.duration) {
        fields.push('duration = $' + (fields.length + 1));
        values.push(jobData.duration);
      }
      if (jobData.startDate) {
        fields.push('start_date = $' + (fields.length + 1));
        values.push(jobData.startDate);
      }
      if (jobData.endDate) {
        fields.push('end_date = $' + (fields.length + 1));
        values.push(jobData.endDate);
      }
      if (jobData.applicationDeadline) {
        fields.push('application_deadline = $' + (fields.length + 1));
        values.push(jobData.applicationDeadline);
      }
      if (jobData.maxApplications !== undefined) {
        fields.push('max_applications = $' + (fields.length + 1));
        values.push(jobData.maxApplications);
      }
      if (jobData.status) {
        fields.push('status = $' + (fields.length + 1));
        values.push(jobData.status);
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      // เพิ่ม id ใน values array
      values.push(id);
      
      const query = `
        UPDATE jobs 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING id, employer_id, title, description, requirements, location,
                 salary_min, salary_max, currency, work_type, duration,
                 start_date, end_date, application_deadline, max_applications,
                 status, views_count, applications_count, created_at, updated_at
      `;
      
      const result = await sql.unsafe(query, values);
      return result[0];
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * ลบงาน
   */
  async deleteJob(id: string) {
    try {
      const result = await sql`
        DELETE FROM jobs 
        WHERE id = ${id}
        RETURNING id, title
      `;
      return result[0];
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * เพิ่มจำนวนการดู
   */
  async incrementViews(id: string) {
    try {
      await sql`
        UPDATE jobs 
        SET views_count = views_count + 1
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }

  /**
   * อัพเดทจำนวนการสมัคร
   */
  async updateApplicationCount(jobId: string) {
    try {
      await sql`
        UPDATE jobs 
        SET applications_count = (
          SELECT COUNT(*) FROM applications WHERE job_id = ${jobId}
        )
        WHERE id = ${jobId}
      `;
    } catch (error) {
      console.error('Error updating application count:', error);
      throw error;
    }
  }

  /**
   * ดึงงานของ employer
   */
  async getJobsByEmployer(employerId: string, options: { limit?: number; offset?: number } = {}) {
    try {
      const { limit = 10, offset = 0 } = options;
      
      const jobs = await sql`
        SELECT id, title, description, location, salary_min, salary_max,
               work_type, status, views_count, applications_count, 
               application_deadline, created_at, updated_at
        FROM jobs 
        WHERE employer_id = ${employerId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const totalResult = await sql`
        SELECT COUNT(*) as total FROM jobs WHERE employer_id = ${employerId}
      `;
      
      return { 
        jobs, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting jobs by employer:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า user สามารถสมัครงานนี้ได้หรือไม่
   */
  async canApplyForJob(jobId: string, userId: string) {
    try {
      // ตรวจสอบว่างานยังเปิดรับสมัครอยู่หรือไม่
      const job = await sql`
        SELECT status, application_deadline, max_applications, applications_count
        FROM jobs 
        WHERE id = ${jobId}
      `;
      
      if (!job[0] || job[0].status !== 'PUBLISHED') {
        return { canApply: false, reason: 'งานนี้ไม่เปิดรับสมัครแล้ว' };
      }
      
      if (job[0].application_deadline && new Date(job[0].application_deadline) < new Date()) {
        return { canApply: false, reason: 'หมดเขตการสมัคร' };
      }
      
      if (job[0].max_applications && job[0].applications_count >= job[0].max_applications) {
        return { canApply: false, reason: 'จำนวนผู้สมัครเต็มแล้ว' };
      }
      
      // ตรวจสอบว่าเคยสมัครแล้วหรือไม่
      const existingApplication = await sql`
        SELECT id FROM applications 
        WHERE job_id = ${jobId} AND student_id = ${userId}
      `;
      
      if (existingApplication[0]) {
        return { canApply: false, reason: 'คุณได้สมัครงานนี้แล้ว' };
      }
      
      return { canApply: true };
    } catch (error) {
      console.error('Error checking if can apply for job:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const jobService = new JobService(); 