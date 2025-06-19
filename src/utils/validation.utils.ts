import { t } from 'elysia';

// Validation schemas using Elysia's built-in validation
export const userSchemas = {
  createUser: t.Object({
    email: t.String({ format: 'email' }),
    username: t.String({ minLength: 3, maxLength: 50 }),
    password: t.String({ minLength: 6 }),
    firstName: t.String({ minLength: 1, maxLength: 100 }),
    lastName: t.String({ minLength: 1, maxLength: 100 }),
    role: t.Union([
      t.Literal('admin'),
      t.Literal('employer'),
      t.Literal('student')
    ]),
    phoneNumber: t.Optional(t.String())
  }),

  login: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 1 })
  }),

  updateProfile: t.Object({
    firstName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
    lastName: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
    phoneNumber: t.Optional(t.String()),
    profileImage: t.Optional(t.String())
  })
};

export const jobSchemas = {
  createJob: t.Object({
    title: t.String({ minLength: 3, maxLength: 200 }),
    description: t.String({ minLength: 10 }),
    requirements: t.Array(t.String()),
    salary: t.Number({ minimum: 0 }),
    salaryType: t.Union([
      t.Literal('hourly'),
      t.Literal('daily'),
      t.Literal('weekly'),
      t.Literal('monthly')
    ]),
    location: t.String({ minLength: 3, maxLength: 200 }),
    category: t.Union([
      t.Literal('food_service'),
      t.Literal('retail'),
      t.Literal('tutoring'),
      t.Literal('office_work'),
      t.Literal('event_staff'),
      t.Literal('delivery'),
      t.Literal('other')
    ]),
    workingHours: t.Object({
      monday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      tuesday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      wednesday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      thursday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      friday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      saturday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      }))),
      sunday: t.Optional(t.Array(t.Object({
        startTime: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
        endTime: t.String({ pattern: '^\\d{2}:\\d{2}$' })
      })))
    }),
    startDate: t.String({ format: 'date' }),
    endDate: t.Optional(t.String({ format: 'date' })),
    maxApplicants: t.Number({ minimum: 1 })
  }),

  updateJob: t.Object({
    title: t.Optional(t.String({ minLength: 3, maxLength: 200 })),
    description: t.Optional(t.String({ minLength: 10 })),
    requirements: t.Optional(t.Array(t.String())),
    salary: t.Optional(t.Number({ minimum: 0 })),
    salaryType: t.Optional(t.Union([
      t.Literal('hourly'),
      t.Literal('daily'),
      t.Literal('weekly'),
      t.Literal('monthly')
    ])),
    location: t.Optional(t.String({ minLength: 3, maxLength: 200 })),
    category: t.Optional(t.Union([
      t.Literal('food_service'),
      t.Literal('retail'),
      t.Literal('tutoring'),
      t.Literal('office_work'),
      t.Literal('event_staff'),
      t.Literal('delivery'),
      t.Literal('other')
    ])),
    status: t.Optional(t.Union([
      t.Literal('draft'),
      t.Literal('active'),
      t.Literal('paused'),
      t.Literal('expired'),
      t.Literal('closed')
    ])),
    maxApplicants: t.Optional(t.Number({ minimum: 1 }))
  })
};

export const applicationSchemas = {
  createApplication: t.Object({
    jobId: t.String(),
    coverLetter: t.Optional(t.String({ maxLength: 1000 }))
  }),

  updateApplication: t.Object({
    status: t.Union([
      t.Literal('pending'),
      t.Literal('reviewing'),
      t.Literal('accepted'),
      t.Literal('rejected'),
      t.Literal('withdrawn')
    ]),
    notes: t.Optional(t.String({ maxLength: 500 }))
  })
};

export const querySchemas = {
  pagination: t.Object({
    page: t.Optional(t.Numeric({ minimum: 1 })),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 }))
  }),

  jobQuery: t.Object({
    page: t.Optional(t.Numeric({ minimum: 1 })),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
    category: t.Optional(t.String()),
    salaryMin: t.Optional(t.Numeric({ minimum: 0 })),
    salaryMax: t.Optional(t.Numeric({ minimum: 0 })),
    location: t.Optional(t.String()),
    status: t.Optional(t.String()),
    search: t.Optional(t.String())
  })
}; 