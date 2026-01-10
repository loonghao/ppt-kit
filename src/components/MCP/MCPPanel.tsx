import { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  Text, 
  Switch, 
  Button, 
  Input,
  Badge,
  Spinner,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field
} from '@fluentui/react-components'
import { 
  Server24Regular, 
  PlugConnected24Regular,
  Add24Regular,
  Delete24Regular,
  Play24Regular,
  CheckmarkCircle24Regular,
  DismissCircle24Regular
} from '@fluentui/react-icons'
import { useAppStore } from '../../store/useAppStore'
import type { MCPClientEndpoint } from '../../types'

export default function MCPPanel() {
  const { mcpServer, setMCPServer, mcpClients, addMCPClient, removeMCPClient, updateMCPClient } = useAppStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '' })
  const [testingId, setTestingId] = useState<string | null>(null)

  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.url) {
      addMCPClient({
        id: Date.now().toString(),
        name: newEndpoint.name,
        url: newEndpoint.url,
        enabled: true,
      })
      setNewEndpoint({ name: '', url: '' })
      setIsAddDialogOpen(false)
    }
  }

  const handleTestConnection = async (endpoint: MCPClientEndpoint) => {
    setTestingId(endpoint.id)
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500))
    updateMCPClient(endpoint.id, { lastConnected: new Date() })
    setTestingId(null)
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* MCP Server Status */}
      <Card className="animate-fade-in">
        <CardHeader
          image={<Server24Regular className="text-primary" />}
          header={<Text weight="semibold">MCP 服务端</Text>}
          description="允许 AI 助手通过 MCP 协议操作 PPT"
        />
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Text>启用服务</Text>
              {mcpServer.enabled && (
                <Badge appearance="filled" color="success" size="small">
                  运行中
                </Badge>
              )}
            </div>
            <Switch
              checked={mcpServer.enabled}
              onChange={(_, data) => setMCPServer({ enabled: data.checked })}
            />
          </div>

          {mcpServer.enabled && (
            <div className="p-3 bg-surface-secondary rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <Text className="text-caption text-text-secondary">端口</Text>
                <Text className="font-mono">{mcpServer.port}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-caption text-text-secondary">连接地址</Text>
                <Text className="font-mono text-xs">ws://localhost:{mcpServer.port}</Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-caption text-text-secondary">可用工具</Text>
                <Text>5 个</Text>
              </div>
            </div>
          )}

          {mcpServer.enabled && (
            <div className="space-y-2">
              <Text className="text-caption text-text-secondary">最近调用</Text>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 bg-surface-secondary rounded text-xs">
                  <span className="font-mono">create_slide</span>
                  <span className="text-text-disabled">2 分钟前</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-surface-secondary rounded text-xs">
                  <span className="font-mono">add_content</span>
                  <span className="text-text-disabled">5 分钟前</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* MCP Client Connections */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader
          image={<PlugConnected24Regular className="text-primary" />}
          header={<Text weight="semibold">MCP 客户端</Text>}
          description="连接外部 MCP 服务获取增强能力"
          action={
            <Button 
              icon={<Add24Regular />} 
              appearance="subtle"
              onClick={() => setIsAddDialogOpen(true)}
            />
          }
        />
        <div className="p-4">
          {mcpClients.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <PlugConnected24Regular className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <Text className="text-body">暂无连接的服务</Text>
              <Text className="text-caption block mt-1">点击 + 添加 MCP 服务端点</Text>
            </div>
          ) : (
            <div className="space-y-3">
              {mcpClients.map((endpoint) => (
                <div 
                  key={endpoint.id}
                  className="p-3 border border-surface-tertiary rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {endpoint.enabled ? (
                        <CheckmarkCircle24Regular className="text-success" />
                      ) : (
                        <DismissCircle24Regular className="text-text-disabled" />
                      )}
                      <Text weight="semibold">{endpoint.name}</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        icon={testingId === endpoint.id ? <Spinner size="tiny" /> : <Play24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => handleTestConnection(endpoint)}
                        disabled={testingId === endpoint.id}
                      />
                      <Button
                        icon={<Delete24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => removeMCPClient(endpoint.id)}
                      />
                    </div>
                  </div>
                  <Text className="text-caption text-text-secondary font-mono block truncate">
                    {endpoint.url}
                  </Text>
                  {endpoint.lastConnected && (
                    <Text className="text-caption text-text-disabled block mt-1">
                      上次连接: {new Date(endpoint.lastConnected).toLocaleString()}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Add Endpoint Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={() => setIsAddDialogOpen(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>添加 MCP 服务端点</DialogTitle>
            <DialogContent>
              <div className="space-y-4 py-4">
                <Field label="服务名称">
                  <Input
                    value={newEndpoint.name}
                    onChange={(_, data) => setNewEndpoint({ ...newEndpoint, name: data.value })}
                    placeholder="例如：AI 图片生成服务"
                  />
                </Field>
                <Field label="服务地址">
                  <Input
                    value={newEndpoint.url}
                    onChange={(_, data) => setNewEndpoint({ ...newEndpoint, url: data.value })}
                    placeholder="例如：ws://localhost:8080"
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button 
                appearance="primary" 
                onClick={handleAddEndpoint}
                disabled={!newEndpoint.name || !newEndpoint.url}
              >
                添加
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}
