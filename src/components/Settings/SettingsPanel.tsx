import { 
  Card, 
  CardHeader, 
  Text, 
  Dropdown, 
  Option, 
  Switch, 
  Slider,
  Divider 
} from '@fluentui/react-components'
import { 
  Color24Regular, 
  Code24Regular, 
  Grid24Regular,
  Eye24Regular 
} from '@fluentui/react-icons'
import { useAppStore } from '../../store/useAppStore'
import type { CodeTheme, LayoutType } from '../../types'

const themes = [
  { name: 'Office Blue', primaryColor: '#0078D4' },
  { name: 'Forest Green', primaryColor: '#107C10' },
  { name: 'Sunset Orange', primaryColor: '#D83B01' },
  { name: 'Royal Purple', primaryColor: '#5C2D91' },
]

const codeThemes: { value: CodeTheme; label: string }[] = [
  { value: 'vs-dark', label: 'VS Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'dracula', label: 'Dracula' },
]

const layouts: { value: LayoutType; label: string }[] = [
  { value: 'content', label: '标准内容' },
  { value: 'title', label: '标题页' },
  { value: 'two-column', label: '双栏布局' },
  { value: 'comparison', label: '对比布局' },
  { value: 'code-focus', label: '代码焦点' },
  { value: 'image-focus', label: '图片焦点' },
]

const densityOptions = [
  { value: 'compact', label: '紧凑' },
  { value: 'normal', label: '标准' },
  { value: 'spacious', label: '宽松' },
]

export default function SettingsPanel() {
  const { settings, updateSettings } = useAppStore()

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Theme Settings */}
      <Card className="animate-fade-in">
        <CardHeader
          image={<Color24Regular className="text-primary" />}
          header={<Text weight="semibold">主题设置</Text>}
          description="选择 PPT 主题模板和配色方案"
        />
        <div className="p-4 space-y-4">
          <div>
            <Text className="text-caption text-text-secondary block mb-2">主题模板</Text>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => updateSettings({ 
                    theme: { ...settings.theme, ...theme } 
                  })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.theme.name === theme.name
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-tertiary hover:border-primary/50'
                  }`}
                >
                  <div 
                    className="w-full h-2 rounded mb-2"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <Text className="text-caption">{theme.name}</Text>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Code Highlight Settings */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader
          image={<Code24Regular className="text-primary" />}
          header={<Text weight="semibold">代码高亮</Text>}
          description="设置代码块的显示样式"
        />
        <div className="p-4 space-y-4">
          <div>
            <Text className="text-caption text-text-secondary block mb-2">代码主题</Text>
            <Dropdown
              value={codeThemes.find(t => t.value === settings.codeTheme)?.label}
              onOptionSelect={(_, data) => {
                const theme = codeThemes.find(t => t.label === data.optionValue)
                if (theme) updateSettings({ codeTheme: theme.value })
              }}
            >
              {codeThemes.map((theme) => (
                <Option key={theme.value} value={theme.label}>
                  {theme.label}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
      </Card>

      {/* Layout Settings */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader
          image={<Grid24Regular className="text-primary" />}
          header={<Text weight="semibold">布局偏好</Text>}
          description="设置默认布局类型和内容密度"
        />
        <div className="p-4 space-y-4">
          <div>
            <Text className="text-caption text-text-secondary block mb-2">默认布局</Text>
            <Dropdown
              value={layouts.find(l => l.value === settings.defaultLayout)?.label}
              onOptionSelect={(_, data) => {
                const layout = layouts.find(l => l.label === data.optionValue)
                if (layout) updateSettings({ defaultLayout: layout.value })
              }}
            >
              {layouts.map((layout) => (
                <Option key={layout.value} value={layout.label}>
                  {layout.label}
                </Option>
              ))}
            </Dropdown>
          </div>

          <Divider />

          <div>
            <Text className="text-caption text-text-secondary block mb-2">内容密度</Text>
            <div className="flex gap-2">
              {densityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ 
                    contentDensity: option.value as 'compact' | 'normal' | 'spacious' 
                  })}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    settings.contentDensity === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-tertiary hover:border-primary/50'
                  }`}
                >
                  <Text className="text-caption">{option.label}</Text>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Settings */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader
          image={<Eye24Regular className="text-primary" />}
          header={<Text weight="semibold">预览设置</Text>}
          description="控制实时预览行为"
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Text>自动预览</Text>
            <Switch
              checked={settings.autoPreview}
              onChange={(_, data) => updateSettings({ autoPreview: data.checked })}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
