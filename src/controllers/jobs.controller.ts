import { Elysia } from 'elysia';
import { ResponseHelper, httpStatus } from '../utils/response.utils';
import { jobSchemas, querySchemas } from '../utils/validation.utils';
import type { CreateJobRequest, UpdateJobRequest, JobQuery } from '../types';
import { JobStatus, JobCategory, SalaryType } from '../types';

export const jobsController = new Elysia({ 
  prefix: '/jobs',
  tags: ['Jobs']
})
  // GET /jobs - Get all jobs with pagination and filters
  .get('/', async ({ query, set }) => {
    try {
      const { page = 1, limit = 10, category, salaryMin, salaryMax, location, status, search } = query;

      // TODO: Implement database query with filters
      // const jobs = await getJobs({
      //   page: Number(page),
      //   limit: Number(limit),
      //   category,
      //   salaryMin: salaryMin ? Number(salaryMin) : undefined,
      //   salaryMax: salaryMax ? Number(salaryMax) : undefined,
      //   location,
      //   status,
      //   search
      // });

      // Mock response for now
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Part-time Barista',
          description: 'Looking for enthusiastic barista to join our team',
          requirements: ['Customer service experience', 'Flexible schedule'],
          salary: 180,
          salaryType: SalaryType.HOURLY,
          location: 'RMU Campus Cafe',
          category: JobCategory.FOOD_SERVICE,
          workingHours: {
            monday: [{ startTime: '08:00', endTime: '16:00' }],
            tuesday: [{ startTime: '08:00', endTime: '16:00' }]
          },
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15'),
          maxApplicants: 5,
          currentApplicants: 2,
          status: JobStatus.ACTIVE,
          employerId: 'employer-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return ResponseHelper.paginated(mockJobs, Number(page), Number(limit), 1);
    } catch (error) {
      console.error('Get jobs error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('Failed to fetch jobs');
    }
  }, {
    query: querySchemas.jobQuery,
    detail: {
      summary: 'Get all jobs',
      description: 'Retrieve all part-time jobs with optional filtering and pagination',
      tags: ['Jobs'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number for pagination'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of items per page'
        },
        {
          name: 'category',
          in: 'query',
          required: false,
          schema: { 
            type: 'string',
            enum: ['food_service', 'retail', 'tutoring', 'office_work', 'event_staff', 'delivery', 'other']
          },
          description: 'Filter by job category'
        },
        {
          name: 'salaryMin',
          in: 'query',
          required: false,
          schema: { type: 'number', minimum: 0 },
          description: 'Minimum salary filter'
        },
        {
          name: 'salaryMax',
          in: 'query',
          required: false,
          schema: { type: 'number', minimum: 0 },
          description: 'Maximum salary filter'
        },
        {
          name: 'location',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by location'
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: { 
            type: 'string',
            enum: ['draft', 'active', 'paused', 'expired', 'closed']
          },
          description: 'Filter by job status'
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Search in job title and description'
        }
      ],
      responses: {
        200: {
          description: 'Jobs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Job' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'number', example: 1 },
                          limit: { type: 'number', example: 10 },
                          total: { type: 'number', example: 25 },
                          totalPages: { type: 'number', example: 3 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  // GET /jobs/:id - Get job by ID
  .get('/:id', async ({ params, set }) => {
    try {
      const { id } = params;

      // TODO: Implement database query
      // const job = await getJobById(id);
      // if (!job) {
      //   set.status = httpStatus.NOT_FOUND;
      //   return ResponseHelper.error('Job not found');
      // }

      // Mock response for now
      const mockJob = {
        id: id,
        title: 'Part-time Barista',
        description: 'Looking for enthusiastic barista to join our team',
        requirements: ['Customer service experience', 'Flexible schedule'],
        salary: 180,
        salaryType: SalaryType.HOURLY,
        location: 'RMU Campus Cafe',
        category: JobCategory.FOOD_SERVICE,
        workingHours: {
          monday: [{ startTime: '08:00', endTime: '16:00' }],
          tuesday: [{ startTime: '08:00', endTime: '16:00' }]
        },
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-15'),
        maxApplicants: 5,
        currentApplicants: 2,
        status: JobStatus.ACTIVE,
        employerId: 'employer-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return ResponseHelper.success(mockJob);
    } catch (error) {
      console.error('Get job error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('Failed to fetch job');
    }
  }, {
    detail: {
      summary: 'Get job by ID',
      description: 'Retrieve a specific part-time job by its ID',
      tags: ['Jobs'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Job ID'
        }
      ],
      responses: {
        200: {
          description: 'Job retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Job' }
                }
              }
            }
          }
        },
        404: {
          description: 'Job not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Job not found' }
                }
              }
            }
          }
        }
      }
    }
  })

  // POST /jobs - Create new job (Employer only)
  .post('/', async ({ body, set, currentUser }: any) => {
    try {
      // TODO: Check if user is employer
      // if (currentUser?.role !== UserRole.EMPLOYER) {
      //   set.status = httpStatus.FORBIDDEN;
      //   return ResponseHelper.error('Only employers can create jobs');
      // }

      // TODO: Create job in database
      // const newJob = await createJob({
      //   ...body,
      //   employerId: currentUser.id,
      //   currentApplicants: 0,
      //   status: JobStatus.DRAFT
      // });

      // Mock response for now
      const mockJob = {
        id: 'job-' + Date.now(),
        ...body,
        currentApplicants: 0,
        status: JobStatus.DRAFT,
        employerId: 'employer-1',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set.status = httpStatus.CREATED;
      return ResponseHelper.success(mockJob, 'Job created successfully');
    } catch (error) {
      console.error('Create job error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('Failed to create job');
    }
  }, {
    body: jobSchemas.createJob,
    detail: {
      summary: 'Create new job',
      description: 'Create a new part-time job posting (Employer only)',
      tags: ['Jobs'],
      security: [{ bearerAuth: [] }],
      responses: {
        201: {
          description: 'Job created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Job' },
                  message: { type: 'string', example: 'Job created successfully' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' }
            }
          }
        },
        403: {
          description: 'Only employers can create jobs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForbiddenError' }
            }
          }
        }
      }
    }
  })

  // PUT /jobs/:id - Update job (Employer only)
  .put('/:id', async ({ params, body, set, currentUser }: any) => {
    try {
      const { id } = params;

      // TODO: Check if job exists and user owns it
      // const existingJob = await getJobById(id);
      // if (!existingJob) {
      //   set.status = httpStatus.NOT_FOUND;
      //   return ResponseHelper.error('Job not found');
      // }
      // if (existingJob.employerId !== currentUser?.id) {
      //   set.status = httpStatus.FORBIDDEN;
      //   return ResponseHelper.error('You can only update your own jobs');
      // }

      // TODO: Update job in database
      // const updatedJob = await updateJob(id, body);

      // Mock response for now
      const mockUpdatedJob = {
        id: id,
        title: body.title || 'Updated Job Title',
        description: body.description || 'Updated description',
        requirements: body.requirements || ['Updated requirement'],
        salary: body.salary || 200,
        salaryType: body.salaryType || SalaryType.HOURLY,
        location: body.location || 'Updated Location',
        category: body.category || JobCategory.OTHER,
        workingHours: {},
        startDate: new Date(),
        endDate: undefined,
        maxApplicants: body.maxApplicants || 10,
        currentApplicants: 0,
        status: body.status || JobStatus.ACTIVE,
        employerId: 'employer-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return ResponseHelper.success(mockUpdatedJob, 'Job updated successfully');
    } catch (error) {
      console.error('Update job error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('Failed to update job');
    }
  }, {
    body: jobSchemas.updateJob,
    detail: {
      summary: 'Update job',
      description: 'Update an existing job posting (Employer only, own jobs only)',
      tags: ['Jobs'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Job ID'
        }
      ],
      responses: {
        200: {
          description: 'Job updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Job' },
                  message: { type: 'string', example: 'Job updated successfully' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' }
            }
          }
        },
        403: {
          description: 'You can only update your own jobs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForbiddenError' }
            }
          }
        },
        404: {
          description: 'Job not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Job not found' }
                }
              }
            }
          }
        }
      }
    }
  })

  // DELETE /jobs/:id - Delete job (Employer only)
  .delete('/:id', async ({ params, set, currentUser }: any) => {
    try {
      const { id } = params;

      // TODO: Check if job exists and user owns it
      // const existingJob = await getJobById(id);
      // if (!existingJob) {
      //   set.status = httpStatus.NOT_FOUND;
      //   return ResponseHelper.error('Job not found');
      // }
      // if (existingJob.employerId !== currentUser?.id) {
      //   set.status = httpStatus.FORBIDDEN;
      //   return ResponseHelper.error('You can only delete your own jobs');
      // }

      // TODO: Delete job from database
      // await deleteJob(id);

      set.status = httpStatus.NO_CONTENT;
      return ResponseHelper.success(null, 'Job deleted successfully');
    } catch (error) {
      console.error('Delete job error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('Failed to delete job');
    }
  }, {
    detail: {
      summary: 'Delete job',
      description: 'Delete a job posting (Employer only, own jobs only)',
      tags: ['Jobs'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Job ID'
        }
      ],
      responses: {
        204: {
          description: 'Job deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Job deleted successfully' }
                }
              }
            }
          }
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' }
            }
          }
        },
        403: {
          description: 'You can only delete your own jobs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForbiddenError' }
            }
          }
        },
        404: {
          description: 'Job not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Job not found' }
                }
              }
            }
          }
        }
      }
    }
  }); 