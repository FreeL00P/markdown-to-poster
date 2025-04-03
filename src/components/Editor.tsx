'use client';
import React, { useState, ChangeEvent, TextareaHTMLAttributes, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster, Md2PosterHeader, Md2PosterFooter } from 'markdown-to-image'
import { Copy, LoaderCircle, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import html2canvas from 'html2canvas';

type Theme = typeof themes[number];

const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ onChange, ...rest }) => {
  return (
    <textarea
      className="border-none bg-gray-100 p-8 w-full resize-none h-full min-h-screen
      focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0
      text-gray-900/70 hover:text-gray-900 focus:text-gray-900 font-light font-inter
      "
      {...rest}
      onChange={(e) => onChange?.(e)}
    />
  )
}

const defaultMd = `# AI Morning News - April 29th
![image](https://imageio.forbes.com/specials-images/imageserve/64b5825a5b9b4d3225e9bd15/artificial-intelligence--ai/960x0.jpg?format=jpg&width=1440)

1. **MetaElephant Company Releases Multi-Modal Large Model XVERSE-V**: Supports image input of any aspect ratio, performs well in multiple authoritative evaluations, and has been open-sourced.
2. **Tongyi Qianwen Team Open-Sources Billion-Parameter Model Qwen1.5-110B**: Uses Transformer decoder architecture, supports multiple languages, and has an efficient attention mechanism.

# AI Technology Updates
3. **Shengshu Technology and Tsinghua University Release Video Large Model Vidu**: Adopts a fusion architecture of Diffusion and Transformer, generates high-definition videos with one click, leading internationally.
4. **Mutable AI Launches Auto Wiki v2**: Automatically converts code into Wikipedia-style articles, solving the problem of code documentation.

# Industry News
5. **Google Builds New Data Center in the U.S.**: Plans to invest $3 billion to build a data center campus in Indiana, expand facilities in Virginia, and launch an artificial intelligence opportunity fund.
6. **China Academy of Information and Communications Technology Releases Automobile Large Model Standard**: Aims to standardize and promote the intelligent development of the automotive industry.

# Product Updates
7. **Kimi Chat Mobile App Update**: Version 1.2.1 completely revamps the user interface, introduces a new light mode, and provides a comfortable and intuitive experience.`

// 修改主题配置
const themes = [
  {
    value: "SpringGradientWave",
    label: "春日渐变",
    background: "bg-gradient-to-br from-green-50 to-blue-50",
    markdownTheme: "default"
  },
  {
    value: "SummerSunset",
    label: "夏日晚霞",
    background: "bg-gradient-to-br from-orange-50 to-pink-50",
    markdownTheme: "default"
  },
  {
    value: "AutumnWarmth",
    label: "秋日暖阳",
    background: "bg-gradient-to-br from-yellow-50 to-orange-50",
    markdownTheme: "default"
  },
  {
    value: "WinterFrost",
    label: "冬日霜雪",
    background: "bg-gradient-to-br from-blue-50 to-indigo-50",
    markdownTheme: "default"
  },
  {
    value: "DarkGradientWave",
    label: "暗夜渐变",
    background: "bg-gradient-to-br from-gray-900 to-gray-800",
    markdownTheme: "dark"
  },
  {
    value: "PurpleNight",
    label: "紫夜静谧",
    background: "bg-gradient-to-br from-purple-900 to-indigo-900",
    markdownTheme: "dark"
  },
  {
    value: "SimpleLight",
    label: "简约亮色",
    background: "bg-white",
    markdownTheme: "github"
  },
  {
    value: "SimpleDark",
    label: "简约暗色", 
    background: "bg-gray-900",
    markdownTheme: "github-dark"
  },
  {
    value: "GithubLight",
    label: "GitHub亮色",
    background: "bg-[#ffffff]",
    markdownTheme: "github"
  },
  {
    value: "GithubDark",
    label: "GitHub暗色",
    background: "bg-[#0d1117]",
    markdownTheme: "github-dark"
  }
] as const;

type RenderMode = 'long' | 'auto-pagination' | 'manual-pagination';

export default function Editor() {
  const [mdString, setMdString] = useState(defaultMd)
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [renderMode, setRenderMode] = useState<RenderMode>('long')
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdString(e.target.value)
  }
  const markdownRef = useRef<any>(null)
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyFromChild = () => {
    setCopyLoading(true)
    markdownRef?.current?.handleCopy().then(res => {
      setCopyLoading(false)
      alert('复制成功!')
    }).catch(err => {
      setCopyLoading(false)
      console.log('复制出错', err)
    })
  }

  const handleDownload = async () => {
    setDownloadLoading(true)
    try {
      const element = containerRef.current;
      if (!element) throw new Error('获取预览元素失败')
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (currentTheme.value.includes('Dark')) {
          gradient.addColorStop(0, '#1a1a1a');
          gradient.addColorStop(1, '#2d2d2d');
        } else {
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#f5f5f5');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(canvas, 0, 0);
      }
      
      const link = document.createElement('a')
      link.download = 'markdown-poster.png'
      link.href = finalCanvas.toDataURL('image/png', 1.0)
      link.click()
      
    } catch (err) {
      console.error('下载出错', err)
      alert('下载失败，请稍后重试')
    }
    setDownloadLoading(false)
  }

  const copySuccessCallback = () => {
    console.log('复制成功回调')
  }

  const handleThemeChange = (value: string) => {
    const newTheme = themes.find(t => t.value === value)
    if (newTheme) {
      setCurrentTheme(newTheme)
    }
  }

  const splitMarkdown = (markdown: string, mode: RenderMode): string[] => {
    if (mode === 'manual-pagination') {
      // 手动分页：按 --- 分割
      return markdown
        .split(/\n\-{3,}\n/)
        .map(content => content.trim())
        .filter(content => content.length > 0);
    } else if (mode === 'auto-pagination') {
      // 自动分页：按标题分割
      const sections = markdown.split(/(?=^# )/gm);
      
      if (sections.length <= 1) {
        // 如果没有标题，则按照固定数量的行数分割
        const lines = markdown.split('\n');
        const pagesCount = Math.ceil(lines.length / 10); // 每页10行
        const pages: string[] = [];
        
        for (let i = 0; i < pagesCount; i++) {
          const start = i * 10;
          const end = start + 10;
          const pageContent = lines.slice(start, end).join('\n');
          if (pageContent.trim()) {
            pages.push(pageContent);
          }
        }
        
        return pages;
      }
      
      return sections.filter(section => section.trim());
    }
    
    // 长图模式：返回整个内容
    return [markdown];
  }

  const Preview = ({ content, index, total }: { content: string, index?: number, total?: number }) => (
    <div className={`
      relative border border-gray-200 rounded-lg p-6 
      ${currentTheme.value.includes("Dark") ? "bg-gray-800/50" : "bg-white/50"} 
      backdrop-blur-sm
    `}>
      <Md2Poster 
        theme={currentTheme.markdownTheme}
        copySuccessCallback={copySuccessCallback} 
        ref={index === 0 ? markdownRef : undefined}
        className={currentTheme.value.includes("Dark") ? "prose-invert" : ""}
      >
        <Md2PosterContent>{content}</Md2PosterContent>
      </Md2Poster>
      {(typeof index === 'number' && typeof total === 'number') && (
        <div className={`
          absolute bottom-2 right-2 px-2 py-1 rounded text-xs
          ${currentTheme.value.includes("Dark") ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}
        `}>
          {index + 1} / {total}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full gap-4">
      {/* 控制面板 */}
      <div className="w-full border-b border-gray-200 pb-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">主题样式</span>
            <Select value={currentTheme.value} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">渲染方式</span>
            <Select value={renderMode} onValueChange={(value: RenderMode) => setRenderMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择渲染方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">长图模式</SelectItem>
                <SelectItem value="auto-pagination">自动分页</SelectItem>
                <SelectItem value="manual-pagination">手动分页</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          <Button className="rounded-xl" onClick={handleCopyFromChild} disabled={copyLoading}>
            {copyLoading ?
              <LoaderCircle className="w-4 h-4 mr-1 animate-spin" />
              : <Copy className="w-4 h-4 mr-1" />}
            复制图片
          </Button>

          <Button className="rounded-xl" onClick={handleDownload} disabled={downloadLoading}>
            {downloadLoading ?
              <LoaderCircle className="w-4 h-4 mr-1 animate-spin" />
              : <Download className="w-4 h-4 mr-1" />}
            下载图片
          </Button>
        </div>
      </div>

      {/* 编辑器主体 */}
      <ScrollArea className="h-[90vh] w-full border-2 border-gray-900 rounded-xl mx-4">
        <div className="flex flex-row h-full">
          <div className="w-1/2">
            <Textarea 
              placeholder="在这里输入 Markdown 内容，使用 --- 来分页"
              onChange={handleChange} 
              defaultValue={mdString}
              spellCheck={false}
            />
          </div>
          <div className="w-1/2 mx-auto flex justify-center p-4">
            <div className="relative w-full flex justify-center">
              <div 
                ref={containerRef}
                className={`flex flex-col w-fit p-8 rounded-xl transition-colors ${currentTheme.background}`}
              >
                {renderMode !== 'long' ? (
                  <div className="flex flex-col gap-8">
                    {(() => {
                      const pages = splitMarkdown(mdString, renderMode);
                      return pages.map((pageContent, index) => (
                        <div key={index} className="page-content">
                          <Preview 
                            content={pageContent} 
                            index={index} 
                            total={pages.length}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <Preview content={mdString} />
                )}
              </div>

              {/* 悬浮按钮 */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className={`
                    backdrop-blur-sm
                    ${currentTheme.value.includes("Dark") 
                      ? "bg-gray-800/80 hover:bg-gray-800/90 text-white" 
                      : "bg-white/80 hover:bg-white/90"}
                  `}
                  onClick={handleCopyFromChild} 
                  disabled={copyLoading}
                >
                  {copyLoading ?
                    <LoaderCircle className="w-4 h-4" />
                    : <Copy className="w-4 h-4" />}
                </Button>

                <Button 
                  variant="outline"
                  size="sm"
                  className={`
                    backdrop-blur-sm
                    ${currentTheme.value.includes("Dark") 
                      ? "bg-gray-800/80 hover:bg-gray-800/90 text-white" 
                      : "bg-white/80 hover:bg-white/90"}
                  `}
                  onClick={handleDownload} 
                  disabled={downloadLoading}
                >
                  {downloadLoading ?
                    <LoaderCircle className="w-4 h-4" />
                    : <Download className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 添加使用说明 */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <p className="text-sm text-gray-500">
          {renderMode === 'manual-pagination' ? (
            '提示：在手动分页模式下，使用 "---" (三个或更多短横线) 来分割不同页面的内容'
          ) : renderMode === 'auto-pagination' ? (
            '提示：在自动分页模式下，会按标题自动分页，如果没有标题则每10行自动分页'
          ) : (
            '提示：长图模式下将生成单张完整图片'
          )}
        </p>
      </div>
    </div>
  )
}
