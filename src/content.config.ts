import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const calculators = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/calculators' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    category: z.string(),
    slug: z.string(),
    keywords: z.array(z.string()),
    calculator: z.object({
      component: z.string(),
      inputs: z.array(z.object({
        name: z.string(),
        label: z.string(),
        unit: z.string(),
        type: z.enum(['number', 'select']),
        options: z.array(z.object({
          value: z.string(),
          label: z.string(),
        })).optional(),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
      })),
    }),
    formula: z.object({
      expression: z.string(),
      steps: z.array(z.string()),
    }),
    example: z.object({
      scenario: z.string(),
      values: z.record(z.union([z.number(), z.string()])),
      result: z.string(),
    }),
    tips: z.array(z.string()),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
    related: z.array(z.string()),
    assumptions: z.array(z.string()).optional(),
    showEstimateDisclaimer: z.boolean().optional(),
    costFactors: z.array(z.object({
      factor: z.string(),
      description: z.string(),
      estimate: z.string(),
    })).optional(),
    commonProjects: z.array(z.object({
      project: z.string(),
      description: z.string(),
      estimate: z.string(),
    })).optional(),
    referenceTable: z.object({
      title: z.string(),
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    }).optional(),
    lastUpdated: z.string().optional(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/categories' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    calculators: z.array(z.string()),
    intro: z.string().optional(),
    howToChoose: z.array(z.string()).optional(),
    scenarios: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).optional(),
    relatedCategories: z.array(z.string()).optional(),
  }),
});

export const collections = { calculators, categories };
