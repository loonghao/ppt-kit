/**
 * PPT-KIT MCP Zod Schemas
 * 
 * Runtime validation schemas for MCP tool inputs using Zod.
 */

import { z } from 'zod'

// Response format enum
export enum ResponseFormat {
  MARKDOWN = 'markdown',
  JSON = 'json'
}

// Layout type enum
export const LayoutTypeSchema = z.enum([
  'title',
  'content', 
  'two-column',
  'comparison',
  'image-focus',
  'code-focus'
])

export type LayoutType = z.infer<typeof LayoutTypeSchema>

// Position schema for content placement
export const PositionSchema = z.object({
  x: z.number().min(0).describe('X coordinate in points'),
  y: z.number().min(0).describe('Y coordinate in points'),
  width: z.number().min(10).describe('Width in points'),
  height: z.number().min(10).describe('Height in points')
}).strict()

export type Position = z.infer<typeof PositionSchema>

// Create slide input schema
export const CreateSlideInputSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .describe('Title text for the new slide'),
  layout: LayoutTypeSchema
    .optional()
    .default('content')
    .describe('Layout type for the slide'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type CreateSlideInput = z.infer<typeof CreateSlideInputSchema>

// Add content input schema
export const AddContentInputSchema = z.object({
  slide_id: z.string()
    .min(1, 'Slide ID is required')
    .describe('The ID of the slide to add content to'),
  content: z.string()
    .min(1, 'Content is required')
    .describe('The content to add (text, code, or base64 image data)'),
  content_type: z.enum(['text', 'code', 'image'])
    .describe('Type of content being added'),
  position: PositionSchema
    .optional()
    .describe('Optional position and size for the content'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type AddContentInput = z.infer<typeof AddContentInputSchema>

// Get presentation info input schema
export const GetPresentationInfoInputSchema = z.object({
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type GetPresentationInfoInput = z.infer<typeof GetPresentationInfoInputSchema>

// Markdown to slides input schema
export const MarkdownToSlidesInputSchema = z.object({
  markdown: z.string()
    .min(1, 'Markdown content is required')
    .max(100000, 'Markdown content must not exceed 100000 characters')
    .describe('Markdown content to convert to slides. Use # or ## headings to create new slides.'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type MarkdownToSlidesInput = z.infer<typeof MarkdownToSlidesInputSchema>

// Add code block input schema
export const AddCodeBlockInputSchema = z.object({
  slide_id: z.string()
    .min(1, 'Slide ID is required')
    .describe('The ID of the slide to add the code block to'),
  code: z.string()
    .min(1, 'Code content is required')
    .max(50000, 'Code must not exceed 50000 characters')
    .describe('The source code to display'),
  language: z.string()
    .min(1, 'Language is required')
    .describe('Programming language for syntax highlighting (e.g., javascript, python, typescript)'),
  position: PositionSchema
    .optional()
    .describe('Optional position and size for the code block'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type AddCodeBlockInput = z.infer<typeof AddCodeBlockInputSchema>

// Add mermaid diagram input schema
export const AddMermaidDiagramInputSchema = z.object({
  slide_id: z.string()
    .min(1, 'Slide ID is required')
    .describe('The ID of the slide to add the diagram to'),
  mermaid_code: z.string()
    .min(1, 'Mermaid code is required')
    .max(20000, 'Mermaid code must not exceed 20000 characters')
    .describe('Mermaid diagram syntax (flowchart, sequence, gantt, etc.)'),
  position: PositionSchema
    .optional()
    .describe('Optional position and size for the diagram'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type AddMermaidDiagramInput = z.infer<typeof AddMermaidDiagramInputSchema>

// List slides input schema
export const ListSlidesInputSchema = z.object({
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum number of slides to return'),
  offset: z.number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Number of slides to skip for pagination'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type ListSlidesInput = z.infer<typeof ListSlidesInputSchema>

// Delete slide input schema
export const DeleteSlideInputSchema = z.object({
  slide_id: z.string()
    .min(1, 'Slide ID is required')
    .describe('The ID of the slide to delete'),
  response_format: z.nativeEnum(ResponseFormat)
    .optional()
    .default(ResponseFormat.JSON)
    .describe('Output format: json or markdown')
}).strict()

export type DeleteSlideInput = z.infer<typeof DeleteSlideInputSchema>
