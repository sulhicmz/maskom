import type { EmailTemplate } from '@/types/data';

export const email_template_data: EmailTemplate[] = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to {{companyName}} - {{userName}}!',
    body: `Dear {{userName}},

Welcome to {{companyName}}! We're thrilled to have you on board.

Your account has been successfully created with the email address {{userEmail}}.

What's next?

• Complete your profile settings
• Explore our content library
• Connect with other users

If you have any questions, feel free to reach out to our support team at {{supportEmail}}.

Best regards,
The {{companyName}} Team`,
    category: 'onboarding',
    tags: ['welcome', 'onboarding', 'new-user'],
    variables: [
      {
        key: 'companyName',
        description: 'The name of the company',
        required: true,
      },
      {
        key: 'userName',
        description: 'The name of the user',
        required: true,
      },
      {
        key: 'userEmail',
        description: 'The email address of the user',
        required: true,
      },
      {
        key: 'supportEmail',
        description: 'The support email address',
        required: false,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
    sentCount: 0,
  },
  {
    id: 2,
    name: 'Blog Post Published',
    subject: 'New blog post: {{blogTitle}}',
    body: `Hi {{userName}},

We're excited to announce a new blog post: "{{blogTitle}}"

{{blogDescription}}

Read the full article here: {{blogUrl}}

Written by: {{authorName}}

Stay tuned for more great content!

Best,
The {{companyName}} Editorial Team`,
    category: 'content',
    tags: ['blog', 'content', 'newsletter'],
    variables: [
      {
        key: 'userName',
        description: 'The name of the recipient',
        required: true,
      },
      {
        key: 'blogTitle',
        description: 'The title of the blog post',
        required: true,
      },
      {
        key: 'blogDescription',
        description: 'A brief description of the blog post',
        required: true,
      },
      {
        key: 'blogUrl',
        description: 'The URL to the full blog post',
        required: true,
      },
      {
        key: 'authorName',
        description: 'The name of the blog post author',
        required: true,
      },
      {
        key: 'companyName',
        description: 'The name of the company',
        required: false,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
    sentCount: 0,
  },
  {
    id: 3,
    name: 'Password Reset',
    subject: 'Password reset request for your account',
    body: `Hi {{userName}},

We received a request to reset the password for your account.

Click the link below to reset your password:
{{resetPasswordUrl}}

This link will expire in {{expiryHours}} hours.

If you did not request this password reset, please ignore this email or contact support at {{supportEmail}}.

Best,
The {{companyName}} Team`,
    category: 'security',
    tags: ['security', 'password-reset'],
    variables: [
      {
        key: 'userName',
        description: 'The name of the user',
        required: true,
      },
      {
        key: 'resetPasswordUrl',
        description: 'The URL to reset the password',
        required: true,
      },
      {
        key: 'expiryHours',
        description: 'The number of hours until the link expires',
        required: true,
      },
      {
        key: 'supportEmail',
        description: 'The support email address',
        required: false,
      },
      {
        key: 'companyName',
        description: 'The name of the company',
        required: false,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
    sentCount: 0,
  },
  {
    id: 4,
    name: 'Order Confirmation',
    subject: 'Order Confirmation #{{orderNumber}}',
    body: `Dear {{userName}},

Thank you for your order!

Order Details:
Order Number: {{orderNumber}}
Order Date: {{orderDate}}

Items:
{{#each orderItems}}
• {{itemName}} - {{itemPrice}}
{{/each}}

Subtotal: {{subtotal}}
Tax: {{tax}}
Total: {{total}}

Your order is being processed and you will receive a shipping confirmation email once it ships.

Thank you for shopping with {{companyName}}!

Best,
The {{companyName}} Team`,
    category: 'ecommerce',
    tags: ['order', 'ecommerce', 'confirmation'],
    variables: [
      {
        key: 'userName',
        description: 'The name of the user',
        required: true,
      },
      {
        key: 'orderNumber',
        description: 'The order number',
        required: true,
      },
      {
        key: 'orderDate',
        description: 'The date of the order',
        required: true,
      },
      {
        key: 'orderItems',
        description: 'Array of order items with itemName and itemPrice',
        required: true,
      },
      {
        key: 'subtotal',
        description: 'The order subtotal',
        required: true,
      },
      {
        key: 'tax',
        description: 'The tax amount',
        required: true,
      },
      {
        key: 'total',
        description: 'The order total',
        required: true,
      },
      {
        key: 'companyName',
        description: 'The name of the company',
        required: false,
      },
    ],
    createdAt: '2026-01-19T00:00:00.000Z',
    updatedAt: '2026-01-19T00:00:00.000Z',
    sentCount: 0,
  },
];

export default email_template_data;