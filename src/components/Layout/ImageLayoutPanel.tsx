import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  isOfficeAvailable, 
  getSelectedSlideIndex,
  addImage,
  addImagesWithLayout,
  alignImages,
  distributeImages,
  getSlideImages,
  showSuccess,
  showError,
  showInfo,
  type ImageLayoutType,
  IMAGE_LAYOUT_OPTIONS
} from '../../modules/ppt-bridge'

// Layout category icons
const BasicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
)

const FeaturedIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="12" height="18" />
    <rect x="17" y="3" width="4" height="8" />
    <rect x="17" y="13" width="4" height="8" />
  </svg>
)

const MagazineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="8" height="10" />
    <rect x="13" y="3" width="8" height="6" />
    <rect x="13" y="11" width="8" height="10" />
    <rect x="3" y="15" width="8" height="6" />
  </svg>
)

const CreativeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
    <rect x="8" y="4" width="4" height="3" transform="rotate(10 10 5.5)" />
    <rect x="16" y="8" width="4" height="3" transform="rotate(-15 18 9.5)" />
    <rect x="12" y="16" width="4" height="3" transform="rotate(5 14 17.5)" />
  </svg>
)

const SpecialIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
)

// Layout preview icons
const SingleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="5" width="14" height="14" rx="1" />
  </svg>
)

const Grid2x2Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="8" height="8" />
    <rect x="13" y="3" width="8" height="8" />
    <rect x="3" y="13" width="8" height="8" />
    <rect x="13" y="13" width="8" height="8" />
  </svg>
)

const Grid3x3Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="5" height="5" />
    <rect x="10" y="3" width="5" height="5" />
    <rect x="17" y="3" width="5" height="5" />
    <rect x="3" y="10" width="5" height="5" />
    <rect x="10" y="10" width="5" height="5" />
    <rect x="17" y="10" width="5" height="5" />
    <rect x="3" y="17" width="5" height="5" />
    <rect x="10" y="17" width="5" height="5" />
    <rect x="17" y="17" width="5" height="5" />
  </svg>
)

const Grid2x3Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="5" height="7" />
    <rect x="10" y="4" width="5" height="7" />
    <rect x="17" y="4" width="5" height="7" />
    <rect x="3" y="13" width="5" height="7" />
    <rect x="10" y="13" width="5" height="7" />
    <rect x="17" y="13" width="5" height="7" />
  </svg>
)

const Grid1x3Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="5" height="12" />
    <rect x="10" y="6" width="5" height="12" />
    <rect x="17" y="6" width="5" height="12" />
  </svg>
)

const Grid1x4Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="4" height="10" />
    <rect x="7.5" y="7" width="4" height="10" />
    <rect x="13" y="7" width="4" height="10" />
    <rect x="18.5" y="7" width="4" height="10" />
  </svg>
)

const SideBySideIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="8" height="16" />
    <rect x="13" y="4" width="8" height="16" />
  </svg>
)

const StackedIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="3" width="16" height="5" />
    <rect x="4" y="10" width="16" height="5" />
    <rect x="4" y="17" width="16" height="5" />
  </svg>
)

const FeaturedLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="12" height="18" />
    <rect x="17" y="3" width="4" height="8" />
    <rect x="17" y="13" width="4" height="8" />
  </svg>
)

const FeaturedRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="4" height="8" />
    <rect x="3" y="13" width="4" height="8" />
    <rect x="9" y="3" width="12" height="18" />
  </svg>
)

const FeaturedTopIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="10" />
    <rect x="3" y="15" width="5" height="6" />
    <rect x="10" y="15" width="5" height="6" />
    <rect x="17" y="15" width="5" height="6" />
  </svg>
)

const FeaturedCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="7" y="7" width="10" height="10" />
    <rect x="2" y="2" width="4" height="4" />
    <rect x="18" y="2" width="4" height="4" />
    <rect x="2" y="18" width="4" height="4" />
    <rect x="18" y="18" width="4" height="4" />
  </svg>
)

const Magazine1Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="11" height="18" />
    <rect x="16" y="3" width="5" height="8" />
    <rect x="16" y="13" width="5" height="8" />
  </svg>
)

const Magazine2Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="10" height="10" />
    <rect x="15" y="3" width="6" height="18" />
    <rect x="3" y="15" width="4" height="6" />
    <rect x="9" y="15" width="4" height="6" />
  </svg>
)

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="5" height="8" />
    <rect x="10" y="3" width="5" height="10" />
    <rect x="17" y="3" width="5" height="6" />
    <rect x="3" y="13" width="5" height="8" />
    <rect x="10" y="15" width="5" height="6" />
    <rect x="17" y="11" width="5" height="10" />
  </svg>
)

const MosaicIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="8" height="10" />
    <rect x="13" y="3" width="8" height="6" />
    <rect x="13" y="11" width="4" height="10" />
    <rect x="19" y="11" width="3" height="10" />
    <rect x="3" y="15" width="8" height="6" />
  </svg>
)

const GalleryWallIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="12" y="3" width="5" height="5" />
    <rect x="19" y="3" width="3" height="7" />
    <rect x="3" y="14" width="4" height="7" />
    <rect x="9" y="10" width="6" height="11" />
    <rect x="17" y="12" width="5" height="9" />
  </svg>
)

const DiagonalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="5" height="4" />
    <rect x="8" y="7" width="5" height="4" />
    <rect x="14" y="12" width="5" height="4" />
    <rect x="17" y="17" width="5" height="4" />
  </svg>
)

const StaircaseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="6" height="5" />
    <rect x="6" y="6" width="6" height="5" />
    <rect x="10" y="9" width="6" height="5" />
    <rect x="14" y="12" width="6" height="5" />
    <rect x="18" y="15" width="4" height="5" />
  </svg>
)

const PyramidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="2" width="6" height="5" />
    <rect x="5" y="9" width="6" height="5" />
    <rect x="13" y="9" width="6" height="5" />
    <rect x="2" y="16" width="6" height="5" />
    <rect x="9" y="16" width="6" height="5" />
    <rect x="16" y="16" width="6" height="5" />
  </svg>
)

const ScatteredIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="6" height="5" transform="rotate(-5 5 6.5)" />
    <rect x="10" y="2" width="5" height="4" transform="rotate(10 12.5 4)" />
    <rect x="16" y="6" width="6" height="5" transform="rotate(5 19 8.5)" />
    <rect x="4" y="13" width="5" height="4" transform="rotate(-8 6.5 15)" />
    <rect x="12" y="11" width="6" height="5" transform="rotate(3 15 13.5)" />
    <rect x="6" y="18" width="5" height="4" transform="rotate(5 8.5 20)" />
  </svg>
)

const CircularIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
    <rect x="10" y="2" width="4" height="3" />
    <rect x="18" y="10" width="4" height="3" />
    <rect x="10" y="19" width="4" height="3" />
    <rect x="2" y="10" width="4" height="3" />
  </svg>
)

const SpiralIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 12 C12 8, 16 8, 16 12 C16 16, 8 16, 8 12 C8 6, 18 6, 18 12 C18 18, 6 18, 6 12" strokeDasharray="2 2" />
    <rect x="10" y="10" width="4" height="4" />
    <rect x="14" y="8" width="3" height="3" />
    <rect x="6" y="11" width="3" height="3" />
    <rect x="11" y="15" width="3" height="3" />
  </svg>
)

const PolaroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <rect x="6" y="4" width="12" height="10" />
    <path d="M8 17h8" />
  </svg>
)

const FilmstripIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="1" />
    <rect x="5" y="7" width="4" height="10" />
    <rect x="10" y="7" width="4" height="10" />
    <rect x="15" y="7" width="4" height="10" />
    <circle cx="4" cy="5" r="0.5" fill="currentColor" />
    <circle cx="4" cy="19" r="0.5" fill="currentColor" />
    <circle cx="20" cy="5" r="0.5" fill="currentColor" />
    <circle cx="20" cy="19" r="0.5" fill="currentColor" />
  </svg>
)

const CollageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="8" height="6" transform="rotate(-5 7 8)" />
    <rect x="8" y="3" width="8" height="6" transform="rotate(8 12 6)" />
    <rect x="12" y="8" width="8" height="6" transform="rotate(-3 16 11)" />
    <rect x="5" y="12" width="8" height="6" transform="rotate(5 9 15)" />
    <rect x="10" y="14" width="8" height="6" transform="rotate(-2 14 17)" />
  </svg>
)

const TimelineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" />
    <rect x="2" y="5" width="4" height="5" />
    <rect x="8" y="8" width="4" height="5" />
    <rect x="14" y="5" width="4" height="5" />
    <rect x="20" y="8" width="2" height="5" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="10" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="12" r="1" fill="currentColor" />
  </svg>
)

const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 3v18M16 3v18M3 8h18M3 16h18" opacity="0.3" />
  </svg>
)

// Map layout IDs to icons
const layoutIcons: Record<ImageLayoutType, React.ReactNode> = {
  'single': <SingleIcon />,
  'side-by-side': <SideBySideIcon />,
  'stacked': <StackedIcon />,
  'grid-1x3': <Grid1x3Icon />,
  'grid-1x4': <Grid1x4Icon />,
  'grid-2x2': <Grid2x2Icon />,
  'grid-2x3': <Grid2x3Icon />,
  'grid-3x3': <Grid3x3Icon />,
  'featured-left': <FeaturedLeftIcon />,
  'featured-right': <FeaturedRightIcon />,
  'featured-top': <FeaturedTopIcon />,
  'featured-center': <FeaturedCenterIcon />,
  'magazine-1': <Magazine1Icon />,
  'magazine-2': <Magazine2Icon />,
  'pinterest': <PinterestIcon />,
  'mosaic': <MosaicIcon />,
  'gallery-wall': <GalleryWallIcon />,
  'diagonal': <DiagonalIcon />,
  'staircase': <StaircaseIcon />,
  'pyramid': <PyramidIcon />,
  'scattered': <ScatteredIcon />,
  'circular': <CircularIcon />,
  'spiral': <SpiralIcon />,
  'polaroid': <PolaroidIcon />,
  'filmstrip': <FilmstripIcon />,
  'collage': <CollageIcon />,
  'timeline': <TimelineIcon />,
  'fullscreen': <FullscreenIcon />,
}

// Category info
const categoryInfo = {
  basic: { name: '基础网格', icon: <BasicIcon />, color: 'text-blue-400' },
  featured: { name: '突出展示', icon: <FeaturedIcon />, color: 'text-green-400' },
  magazine: { name: '杂志风格', icon: <MagazineIcon />, color: 'text-purple-400' },
  creative: { name: '创意布局', icon: <CreativeIcon />, color: 'text-orange-400' },
  special: { name: '特殊效果', icon: <SpecialIcon />, color: 'text-pink-400' },
}

// Alignment icons
const AlignLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="3" y="4" width="2" height="16" />
    <rect x="7" y="6" width="14" height="4" />
    <rect x="7" y="14" width="10" height="4" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="11" y="4" width="2" height="16" />
    <rect x="4" y="6" width="16" height="4" />
    <rect x="6" y="14" width="12" height="4" />
  </svg>
)

const AlignRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="19" y="4" width="2" height="16" />
    <rect x="3" y="6" width="14" height="4" />
    <rect x="7" y="14" width="10" height="4" />
  </svg>
)

const AlignTopIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="4" y="3" width="16" height="2" />
    <rect x="6" y="7" width="4" height="14" />
    <rect x="14" y="7" width="4" height="10" />
  </svg>
)

const AlignMiddleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="4" y="11" width="16" height="2" />
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="6" width="4" height="12" />
  </svg>
)

const AlignBottomIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="4" y="19" width="16" height="2" />
    <rect x="6" y="3" width="4" height="14" />
    <rect x="14" y="7" width="4" height="10" />
  </svg>
)

const DistributeHIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="4" y="6" width="4" height="12" />
    <rect x="10" y="8" width="4" height="8" />
    <rect x="16" y="6" width="4" height="12" />
  </svg>
)

const DistributeVIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <rect x="6" y="4" width="12" height="4" />
    <rect x="8" y="10" width="8" height="4" />
    <rect x="6" y="16" width="12" height="4" />
  </svg>
)

interface AlignOption {
  id: string
  name: string
  icon: React.ReactNode
  action: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v'
}

const alignOptions: AlignOption[] = [
  { id: 'align-left', name: '左对齐', icon: <AlignLeftIcon />, action: 'left' },
  { id: 'align-center', name: '水平居中', icon: <AlignCenterIcon />, action: 'center' },
  { id: 'align-right', name: '右对齐', icon: <AlignRightIcon />, action: 'right' },
  { id: 'align-top', name: '顶部对齐', icon: <AlignTopIcon />, action: 'top' },
  { id: 'align-middle', name: '垂直居中', icon: <AlignMiddleIcon />, action: 'middle' },
  { id: 'align-bottom', name: '底部对齐', icon: <AlignBottomIcon />, action: 'bottom' },
  { id: 'distribute-h', name: '水平分布', icon: <DistributeHIcon />, action: 'distribute-h' },
  { id: 'distribute-v', name: '垂直分布', icon: <DistributeVIcon />, action: 'distribute-v' },
]

type LayoutCategory = 'basic' | 'featured' | 'magazine' | 'creative' | 'special'

export default function ImageLayoutPanel() {
  const [selectedLayout, setSelectedLayout] = useState<ImageLayoutType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<LayoutCategory>('basic')
  const [selectedAlign, setSelectedAlign] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [slideImages, setSlideImages] = useState<Array<{ id: string; name: string }>>([])
  const [useSlideImages, setUseSlideImages] = useState(false)
  const [selectedSlideImageIds, setSelectedSlideImageIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get layouts for current category
  const currentLayouts = IMAGE_LAYOUT_OPTIONS.filter(l => l.category === selectedCategory)

  // Auto-fetch slide images on mount and when Office becomes available
  useEffect(() => {
    const fetchSlideImages = async () => {
      if (!isOfficeAvailable()) return
      
      try {
        const slideResult = await getSelectedSlideIndex()
        const slideIndex = slideResult.success ? slideResult.data! : 0
        const imagesResult = await getSlideImages(slideIndex)
        
        if (imagesResult.success && imagesResult.data && imagesResult.data.images.length > 0) {
          setSlideImages(imagesResult.data.images.map(img => ({ id: img.id, name: img.name })))
          // Auto-select all images by default
          setSelectedSlideImageIds(imagesResult.data.images.map(img => img.id))
        }
      } catch (err) {
        console.log('[ImageLayoutPanel] Auto-fetch failed:', err)
      }
    }

    // Initial fetch
    fetchSlideImages()

    // Set up interval to refresh slide images periodically (every 3 seconds)
    const intervalId = setInterval(fetchSlideImages, 3000)

    return () => clearInterval(intervalId)
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      newImages.push(base64)
    }
    
    setUploadedImages(prev => [...prev, ...newImages])
    showSuccess(`已添加 ${newImages.length} 张图片`)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const newImages: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      newImages.push(base64)
    }
    
    setUploadedImages(prev => [...prev, ...newImages])
    showSuccess(`已添加 ${newImages.length} 张图片`)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Fetch images from current slide
  const handleFetchSlideImages = useCallback(async () => {
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0
      const imagesResult = await getSlideImages(slideIndex)
      
      if (imagesResult.success && imagesResult.data) {
        setSlideImages(imagesResult.data.images.map(img => ({ id: img.id, name: img.name })))
        if (imagesResult.data.images.length > 0) {
          showSuccess(`找到 ${imagesResult.data.images.length} 张图片`)
          setUseSlideImages(true)
        } else {
          showInfo('当前幻灯片没有图片')
        }
      }
    } catch (err) {
      showError(`获取失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleAddSingleImage = useCallback(async () => {
    if (uploadedImages.length === 0) {
      showInfo('请先上传图片')
      return
    }

    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      const result = await addImage(slideIndex, uploadedImages[0])
      
      if (result.success) {
        showSuccess('图片已添加')
        setUploadedImages(prev => prev.slice(1))
      } else {
        showError(result.error || '添加失败')
      }
    } catch (err) {
      showError(`操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [uploadedImages])

  const handleLayoutClick = useCallback(async (layout: ImageLayoutType) => {
    setSelectedLayout(layout)
    
    const layoutOption = IMAGE_LAYOUT_OPTIONS.find(l => l.id === layout)
    if (!layoutOption) return

    // Check image count
    const imageCount = useSlideImages ? selectedSlideImageIds.length : uploadedImages.length
    
    if (imageCount === 0) {
      showInfo(useSlideImages ? '请先选择幻灯片中的图片' : '请先上传图片')
      return
    }

    if (imageCount < layoutOption.minImages) {
      showInfo(`${layoutOption.name} 至少需要 ${layoutOption.minImages} 张图片，当前 ${imageCount} 张`)
      return
    }

    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      return
    }

    setIsLoading(true)
    try {
      const slideResult = await getSelectedSlideIndex()
      const slideIndex = slideResult.success ? slideResult.data! : 0

      if (useSlideImages && selectedSlideImageIds.length > 0) {
        // Re-layout existing images on slide
        // For now, we'll show a message - full implementation would move existing shapes
        showInfo('重新布局功能开发中，请使用上传图片方式')
      } else {
        const imagesToAdd = uploadedImages.slice(0, layoutOption.maxImages)
        const result = await addImagesWithLayout(slideIndex, imagesToAdd, layout)
        
        if (result.success) {
          showSuccess(`${imagesToAdd.length} 张图片已添加`)
          setUploadedImages(prev => prev.slice(imagesToAdd.length))
          if (result.data) {
            setSelectedImageIds(result.data.shapeIds)
          }
        } else {
          showError(result.error || '添加失败')
        }
      }
    } catch (err) {
      showError(`操作失败: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [uploadedImages, useSlideImages, selectedSlideImageIds])

  const handleAlignClick = useCallback(async (option: AlignOption) => {
    setSelectedAlign(option.id)
    
    if (!isOfficeAvailable()) {
      showError('PowerPoint 未连接')
      setTimeout(() => setSelectedAlign(null), 200)
      return
    }

    const slideResult = await getSelectedSlideIndex()
    const slideIndex = slideResult.success ? slideResult.data! : 0

    // Use selected slide images or recently added images
    let idsToAlign = useSlideImages && selectedSlideImageIds.length >= 2 
      ? selectedSlideImageIds 
      : selectedImageIds

    if (idsToAlign.length < 2) {
      // Try to get images from current slide
      const imagesResult = await getSlideImages(slideIndex)
      
      if (imagesResult.success && imagesResult.data && imagesResult.data.images.length >= 2) {
        idsToAlign = imagesResult.data.images.map(img => img.id)
        setSelectedImageIds(idsToAlign)
      } else {
        showInfo('请先添加至少 2 张图片')
        setTimeout(() => setSelectedAlign(null), 200)
        return
      }
    }

    if (option.action === 'distribute-h' || option.action === 'distribute-v') {
      if (idsToAlign.length >= 3) {
        await distributeImages(slideIndex, idsToAlign, option.action === 'distribute-h' ? 'horizontal' : 'vertical')
        showSuccess('图片已分布')
      } else {
        showInfo('分布需要至少 3 张图片')
      }
    } else {
      await alignImages(slideIndex, idsToAlign, option.action)
      showSuccess('图片已对齐')
    }
    
    setTimeout(() => setSelectedAlign(null), 200)
  }, [selectedImageIds, useSlideImages, selectedSlideImageIds])

  const handleClearImages = useCallback(() => {
    setUploadedImages([])
    setSelectedImageIds([])
    showInfo('已清空图片列表')
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const toggleSlideImageSelection = useCallback((id: string) => {
    setSelectedSlideImageIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4 bg-theme">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-theme-elevated px-4 py-2 rounded-lg text-sm text-theme shadow-theme-lg">
            处理中...
          </div>
        </div>
      )}

      {/* Upload Section */}
      <section className="section-container">
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>上传图片</span>
          {uploadedImages.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
              {uploadedImages.length} 张待处理
            </span>
          )}
        </div>
        
        <div className="section-content">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="upload-zone"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-2 text-theme-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm text-theme-secondary">点击或拖拽上传图片</p>
            <p className="text-xs text-theme-muted mt-1">支持 JPG、PNG、GIF 等格式</p>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-muted">已上传图片</span>
                <button 
                  onClick={handleClearImages}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  清空全部
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.slice(0, 8).map((img, index) => (
                  <div key={index} className="image-thumbnail group">
                    <img 
                      src={img} 
                      alt={`上传图片 ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="image-thumbnail-remove"
                    >
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {uploadedImages.length > 8 && (
                  <div className="w-14 h-14 rounded-lg border-2 border-dashed border-theme flex items-center justify-center text-xs text-theme-muted">
                    +{uploadedImages.length - 8}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleAddSingleImage}
                disabled={isLoading || uploadedImages.length === 0}
                className="w-full btn-primary"
              >
                添加单张图片
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Use Slide Images Section */}
      <section className="section-container">
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span>幻灯片图片</span>
          {slideImages.length > 0 && (
            <span className="ml-2 text-xs text-green-500">自动同步中</span>
          )}
          <button
            onClick={handleFetchSlideImages}
            disabled={isLoading}
            className="ml-auto text-xs text-primary-500 hover:text-primary-400 flex items-center gap-1 transition-colors"
          >
            <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            刷新
          </button>
        </div>

        <div className="section-content">
          {slideImages.length === 0 ? (
            <div className="text-center py-6 text-sm text-theme-muted">
              <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p>当前幻灯片暂无图片</p>
              <p className="text-xs mt-1">添加图片后将自动显示</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-theme-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSlideImages}
                    onChange={(e) => setUseSlideImages(e.target.checked)}
                    className="w-4 h-4 rounded border-theme accent-primary-500"
                  />
                  使用幻灯片中的图片进行布局
                </label>
                <button
                  onClick={() => setSelectedSlideImageIds(
                    selectedSlideImageIds.length === slideImages.length 
                      ? [] 
                      : slideImages.map(img => img.id)
                  )}
                  className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
                >
                  {selectedSlideImageIds.length === slideImages.length ? '取消全选' : '全选'}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {slideImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => toggleSlideImageSelection(img.id)}
                    className={`chip ${selectedSlideImageIds.includes(img.id) ? 'chip-active' : ''}`}
                  >
                    {img.name || `图片 ${index + 1}`}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-theme-muted pt-2 border-t border-theme">
                <span>已选 {selectedSlideImageIds.length} / {slideImages.length} 张</span>
                {useSlideImages && selectedSlideImageIds.length > 0 && (
                  <span className="text-green-500">可用于布局</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Layout Category Tabs */}
      <section className="section-container">
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>图片布局</span>
          <span className="ml-auto text-xs text-theme-muted">{IMAGE_LAYOUT_OPTIONS.length} 种</span>
        </div>

        <div className="section-content space-y-4">
          {/* Category Tabs */}
          <div className="category-tabs">
            {(Object.keys(categoryInfo) as LayoutCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-tab ${selectedCategory === cat ? 'category-tab-active' : ''}`}
              >
                <span className={selectedCategory === cat ? '' : categoryInfo[cat].color}>
                  {categoryInfo[cat].icon}
                </span>
                {categoryInfo[cat].name}
              </button>
            ))}
          </div>
          
          {/* Layout Grid */}
          <div className="grid grid-cols-3 gap-2">
            {currentLayouts.map((option) => {
              const imageCount = useSlideImages ? selectedSlideImageIds.length : uploadedImages.length
              const isDisabled = isLoading || imageCount < option.minImages
              const needsMore = imageCount < option.minImages
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleLayoutClick(option.id)}
                  disabled={isDisabled}
                  className={`layout-item ${selectedLayout === option.id ? 'layout-item-active' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                  title={`${option.name}\n${option.description}\n需要 ${option.minImages}-${option.maxImages} 张图片`}
                >
                  <div className={`icon-box ${selectedLayout === option.id ? 'icon-box-primary' : ''}`}>
                    {layoutIcons[option.id]}
                  </div>
                  <span className="text-xs text-center leading-tight">{option.name}</span>
                  <span className={`text-[10px] ${needsMore ? 'text-orange-500' : 'text-theme-muted'}`}>
                    {needsMore ? `需${option.minImages}张` : `${option.minImages}-${option.maxImages}张`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Alignment Section */}
      <section className="section-container">
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H3" />
            <path d="M21 6H3" />
            <path d="M21 14H3" />
            <path d="M21 18H3" />
          </svg>
          <span>对齐与分布</span>
        </div>
        
        <div className="section-content">
          <div className="grid grid-cols-4 gap-2">
            {alignOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAlignClick(option)}
                disabled={isLoading}
                className={`tool-btn ${selectedAlign === option.id ? 'tool-btn-active' : ''}`}
                title={option.name}
              >
                {option.icon}
                <span className="text-[11px]">{option.name.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="section-container">
        <div className="section-header">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
          <span>快捷操作</span>
        </div>
        
        <div className="section-content">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => showInfo('统一尺寸功能开发中...')}
              className="btn-secondary"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9H21" />
                <path d="M9 21V9" />
              </svg>
              统一尺寸
            </button>
            <button 
              onClick={() => showInfo('批量裁剪功能开发中...')}
              className="btn-secondary"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8A2 2 0 0 0 19 6H5A2 2 0 0 0 3 8V16A2 2 0 0 0 5 18H19A2 2 0 0 0 21 16Z" />
                <path d="M7 6V4A2 2 0 0 1 9 2H15A2 2 0 0 1 17 4V6" />
              </svg>
              批量裁剪
            </button>
            <button 
              onClick={() => showInfo('智能排序功能开发中...')}
              className="btn-secondary"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3V21" />
                <path d="M19 12L12 19L5 12" />
              </svg>
              智能排序
            </button>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="info-box">
        <svg viewBox="0 0 24 24" className="info-box-icon w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div className="info-box-content">
          <p className="info-box-title">使用提示</p>
          <p>1. 上传图片或获取幻灯片中的图片</p>
          <p>2. 选择布局分类，点击布局样式一键排版</p>
          <p>3. 每种布局显示所需的最少图片数量</p>
          <p>4. 对齐和分布功能可用于已添加的图片</p>
        </div>
      </section>
    </div>
  )
}
