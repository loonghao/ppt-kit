/**
 * PPT Bridge Operations
 * 
 * Modular PowerPoint operations using official Office.js API.
 * @see https://learn.microsoft.com/en-us/javascript/api/powerpoint
 * 
 * Structure:
 * - types.ts        - Type definitions based on official API
 * - utils.ts        - Shared utility functions
 * - presentation.ts - Presentation-level operations
 * - slides.ts       - Slide management (create, delete)
 * - content.ts      - Content operations (text, lists, shapes)
 * - code.ts         - Code block operations with syntax highlighting
 * - media.ts        - Image and media operations (using setImage API)
 * - diagrams.ts     - Mermaid diagrams, charts, and tables
 * - generator.ts    - Batch slide generation
 */

// Types
export type {
  SlideInfo,
  PresentationInfo,
  OperationResult,
  Position,
  ShapeAddOptions,
  LayoutType,
  GeometricShapeType,
  ConnectorType,
  TextVerticalAlignment
} from './types'

// Utils
export {
  isOfficeAvailable,
  isOfficeEnvironment,
  getTitleRect,
  errorResult,
  successResult,
  toShapeAddOptions,
  SLIDE_WIDTH,
  SLIDE_HEIGHT
} from './utils'

// Presentation operations
export {
  getPresentationInfo,
  goToSlide,
  listSlides,
  getSelectedSlideIndex
} from './presentation'

// Slide operations
export {
  createSlide,
  createSlideWithMatchingLayout,
  deleteSlide,
  deleteSlideById,
  getSlideCount
} from './slides'

// Content operations
export {
  addTextToSlide,
  addListToSlide,
  addShapeToSlide,
  addLineToSlide,
  addContentBlockToSlide
} from './content'

// Code operations
export {
  addCodeToSlide,
  addInlineCode,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from './code'

// Media operations
export {
  addImageToSlide,
  addImageFromUrl,
  addVideoPlaceholder,
  addIconToSlide
} from './media'

// Diagram operations
export {
  addMermaidToSlide,
  addChartToSlide,
  addTableToSlide,
  detectDiagramType,
  MERMAID_DIAGRAM_TYPES,
  type MermaidDiagramType
} from './diagrams'

// Generator operations
export {
  generateSlides,
  generateSlideFromTemplate,
  SLIDE_TEMPLATES,
  type SlideTemplateId
} from './generator'

// Notification operations
export {
  showNotification,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showDialog,
  closeDialog,
  type NotificationType
} from './notification'

// Image operations (actual images, not shapes)
export {
  addImage,
  addImagesWithLayout,
  cropImageToShape,
  applyImageFilter,
  alignImages,
  distributeImages,
  getSlideImages,
  getSelectedImages,
  IMAGE_LAYOUT_OPTIONS,
  type ImageLayoutType,
  type ImageFilterType
} from './images'
