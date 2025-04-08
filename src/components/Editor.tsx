'use client';
import React, { useState, ChangeEvent, TextareaHTMLAttributes, useRef, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster } from 'markdown-to-image'
import { Copy, LoaderCircle, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import html2canvas from 'html2canvas';
import { Slider } from "@/components/ui/slider"
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { editorTheme } from '@/lib/editor-theme';

type ThemeType = 'blue' | 'pink' | 'purple' | 'green' | 'yellow' | 'gray' | 'red' | 'indigo' | 'SpringGradientWave';

interface ThemeConfig {
  value: string;
  label: string;
  background: string;
  markdownTheme: ThemeType;
}

const themes: ThemeConfig[] = [
  {
    value: "SpringGradientWave",
    label: "春日渐变",
    background: "bg-gradient-to-br from-green-50 to-blue-50",
    markdownTheme: "SpringGradientWave"
  },
  {
    value: "SummerSunset",
    label: "夏日晚霞",
    background: "bg-gradient-to-br from-orange-50 to-pink-50",
    markdownTheme: "pink"
  },
  {
    value: "AutumnWarmth",
    label: "秋日暖阳",
    background: "bg-gradient-to-br from-yellow-50 to-orange-50",
    markdownTheme: "yellow"
  },
  {
    value: "WinterFrost",
    label: "冬日霜雪",
    background: "bg-gradient-to-br from-blue-50 to-indigo-50",
    markdownTheme: "blue"
  },
  {
    value: "DarkGradientWave",
    label: "暗夜渐变",
    background: "bg-gradient-to-br from-gray-900 to-gray-800",
    markdownTheme: "gray"
  },
  {
    value: "PurpleNight",
    label: "紫夜静谧",
    background: "bg-gradient-to-br from-purple-900 to-indigo-900",
    markdownTheme: "purple"
  },
  {
    value: "SimpleLight",
    label: "简约亮色",
    background: "bg-white",
    markdownTheme: "indigo"
  },
  {
    value: "SimpleDark",
    label: "简约暗色", 
    background: "bg-gray-900",
    markdownTheme: "gray"
  },
  {
    value: "GithubLight",
    label: "GitHub亮色",
    background: "bg-[#ffffff]",
    markdownTheme: "indigo"
  },
  {
    value: "GithubDark",
    label: "GitHub暗色",
    background: "bg-[#0d1117]",
    markdownTheme: "gray"
  }
] as const;

type Theme = typeof themes[number];

type RenderMode = 'long' | 'auto-pagination' | 'manual-pagination';

// 修改比例类型定义
type AspectRatio = '4:3' | '16:9' | 'auto';

const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ onChange, value, ...rest }) => {
  const handleEditorChange = (value: string | undefined) => {
    if (onChange && value !== undefined) {
      const event = {
        target: { value },
      } as ChangeEvent<HTMLTextAreaElement>;
      onChange(event);
    }
  };

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    // 注册自定义主题
    monaco.editor.defineTheme('markdown-light', editorTheme);
    monaco.editor.setTheme('markdown-light');

    // 配置 Markdown 折叠规则
    editor.updateOptions({
      folding: true,
      foldingStrategy: 'indentation',
      foldingHighlight: true,
      foldingImportsByDefault: true,
      showFoldingControls: 'always',
      foldingRanges: {
        start: /^#+\s+|\s*```/,
        end: /^#+\s+|\s*```/
      },
      lineDecorationsWidth: 20,
      lineNumbersMinChars: 3,
      glyphMargin: true,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      lineHeight: 24,
      padding: { top: 16, bottom: 16 },
      wordWrap: 'on',
      bracketPairColorization: {
        enabled: true
      },
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveBracketPair: true,
        highlightActiveIndentation: true
      },
      // 滚动条配置
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        arrowSize: 0,
        handleMouseWheel: true,
        alwaysConsumeMouseWheel: false
      },
      // 编辑器外观
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      renderValidationDecorations: 'on',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      cursorStyle: 'line',
      smoothScrolling: true,
      mouseWheelZoom: true,
      // 内容配置
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      trimAutoWhitespace: true,
      // 选择配置
      selectOnLineNumbers: true,
      selectionHighlight: true,
      selectionClipboard: true,
      // 其他配置
      contextmenu: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
      parameterHints: {
        enabled: true
      }
    });

    // 注册 Markdown 语言配置
    monaco.languages.register({ id: 'markdown' });
    monaco.languages.setLanguageConfiguration('markdown', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['```', '```'],
        ['`', '`']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '```', close: '```' },
        { open: '`', close: '`' }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '```', close: '```' },
        { open: '`', close: '`' }
      ],
      folding: {
        markers: {
          start: /^#+\s+|\s*```/,
          end: /^#+\s+|\s*```/
        }
      }
    });
  }, []);

  return (
    <div className="w-full h-full">
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        value={value as string}
        onChange={handleEditorChange}
        theme="markdown-light"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          fontSize: 14,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          wordWrap: 'on',
          automaticLayout: true,
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            indentation: true,
            bracketPairs: true,
            bracketPairsHorizontal: true,
            highlightActiveBracketPair: true,
            highlightActiveIndentation: true
          },
          suggest: {
            preview: true,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true
          }
        }}
      />
    </div>
  );
};

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

export default function Editor() {
  const [mdString, setMdString] = useState(defaultMd)
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [renderMode, setRenderMode] = useState<RenderMode>('long')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto')
  const [bgOpacity, setBgOpacity] = useState(100);
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdString(e.target.value)
  }
  const markdownRef = useRef<any>(null)
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyFromChild = async (container: HTMLElement) => {
    setCopyLoading(true);
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: currentTheme.value.includes("Dark") ? '#1a1a1a' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png', 1.0);
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      alert('复制成功!');
    } catch (err) {
      console.error('复制出错', err);
      alert('复制失败，请稍后重试');
    }
    setCopyLoading(false);
  };

  const handleDownload = async (container: HTMLElement) => {
    setDownloadLoading(true);
    try {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.padding = '24px';
      wrapper.style.backgroundColor = currentTheme.value.includes("Dark") ? '#1a1a1a' : '#ffffff';
      
      const clone = container.cloneNode(true) as HTMLElement;
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      try {
        const canvas = await html2canvas(wrapper, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        const link = document.createElement('a');
        link.download = 'markdown-poster.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } finally {
        document.body.removeChild(wrapper);
      }
    } catch (err) {
      console.error('下载出错', err);
      alert('下载失败，请稍后重试');
    }
    setDownloadLoading(false);
  };

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

  const handleDownloadAll = async () => {
    setDownloadLoading(true);
    try {
      const containers = document.querySelectorAll('.page-content');
      
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i] as HTMLElement;
        if (!container) continue;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.padding = '24px';
        wrapper.style.backgroundColor = currentTheme.value.includes("Dark") ? '#1a1a1a' : '#ffffff';
        
        const clone = container.cloneNode(true) as HTMLElement;
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        try {
          const canvas = await html2canvas(wrapper, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const link = document.createElement('a');
          link.download = `markdown-poster-${String(i + 1).padStart(2, '0')}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();

          // 添加延迟避免浏览器阻塞
          await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
          document.body.removeChild(wrapper);
        }
      }
      alert('所有图片下载完成!');
    } catch (err) {
      console.error('下载出错', err);
      alert('下载失败，请稍后重试');
    }
    setDownloadLoading(false);
  };

  // 修改 getAspectRatioStyle 函数
  const getAspectRatioStyle = (ratio: AspectRatio) => {
    switch (ratio) {
      case '4:3':
        return 'aspect-[3/4]'; // 高:宽 = 4:3 转换为 宽:高 = 3:4
      case '16:9':
        return 'aspect-[9/16]'; // 高:宽 = 16:9 转换为 宽:高 = 9:16
      default:
        return ''; // 自适应模式不添加样式
    }
  };

  const Preview = React.memo(({ content, index, total }: { 
    content: string, 
    index?: number, 
    total?: number 
  }) => {
    const previewRef = useRef<HTMLDivElement>(null);

    // 判断是否为最后一页
    const isLastPage = total !== undefined && index === total - 1;

    // 获取当前页面的比例样式
    const getPageAspectStyle = () => {
      if (renderMode === 'long' || aspectRatio === 'auto' || isLastPage) {
        return '';
      }
      return getAspectRatioStyle(aspectRatio);
    };

    return (
      <div className="page-content relative group w-full mb-8">
        <div ref={previewRef}>
          <Md2Poster 
            theme={currentTheme.markdownTheme}
            copySuccessCallback={copySuccessCallback}
            className={`
              ${currentTheme.value.includes("Dark") ? "prose-invert" : ""}
              ${getPageAspectStyle()}
              relative rounded-lg overflow-hidden ${currentTheme.background}
              w-full
              ${bgOpacity !== 100 ? `opacity-${bgOpacity}` : ''}
            `}
          >
            <div className={`
              w-full h-full flex flex-col
              ${renderMode !== 'long' && aspectRatio !== 'auto' && !isLastPage ? 'justify-center' : ''}
            `}>
              <Md2PosterContent>{content}</Md2PosterContent>
            </div>
          </Md2Poster>
        </div>
        
        {/* 悬浮按钮组 */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 复制按钮 */}
          <Button 
            variant="outline"
            size="sm"
            className={`
              backdrop-blur-sm rounded-lg w-8 h-8 p-0
              ${currentTheme.value.includes("Dark") 
                ? "bg-gray-800/80 hover:bg-gray-800/90 text-white border-gray-700" 
                : "bg-white/80 hover:bg-white/90 border-gray-200"}
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (previewRef.current) {
                handleCopyFromChild(previewRef.current);
              }
            }}
            disabled={copyLoading}
            title="复制图片"
          >
            {copyLoading ?
              <LoaderCircle className="w-4 h-4 animate-spin" />
              : <Copy className="w-4 h-4" />}
          </Button>

          {/* 下载按钮 */}
          <Button 
            variant="outline"
            size="sm"
            className={`
              backdrop-blur-sm rounded-lg w-8 h-8 p-0
              ${currentTheme.value.includes("Dark") 
                ? "bg-gray-800/80 hover:bg-gray-800/90 text-white border-gray-700" 
                : "bg-white/80 hover:bg-white/90 border-gray-200"}
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (previewRef.current) {
                handleDownload(previewRef.current);
              }
            }}
            disabled={downloadLoading}
            title="下载当前图片"
          >
            {downloadLoading ?
              <LoaderCircle className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
          </Button>

          {/* 只在第一页显示下载全部按钮 */}
          {(index === 0 && total && total > 1) && (
            <Button 
              variant="outline"
              size="sm"
              className={`
                backdrop-blur-sm rounded-lg w-8 h-8 p-0
                ${currentTheme.value.includes("Dark") 
                  ? "bg-gray-800/80 hover:bg-gray-800/90 text-white border-gray-700" 
                  : "bg-white/80 hover:bg-white/90 border-gray-200"}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadAll();
              }}
              disabled={downloadLoading}
              title="下载全部图片"
            >
              {downloadLoading ?
                <LoaderCircle className="w-4 h-4 animate-spin" />
                : <div className="relative">
                    <Download className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold">*</span>
                  </div>
              }
            </Button>
          )}
        </div>
      </div>
    );
  });
  Preview.displayName = 'Preview';

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

          {/* 只在分页模式下显示比例选择器 */}
          {renderMode !== 'long' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">图片比例</span>
                <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="选择比例" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自适应</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 透明度控制 - 移到外层,所有模式都显示 */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">背景透明度</span>
            <Slider
              className="w-[200px]"
              value={[bgOpacity]}
              onValueChange={(value) => setBgOpacity(value[0])}
              max={100}
              step={1}
            />
            <span className="text-sm text-gray-500 w-9">{bgOpacity}%</span>
          </div>
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
                className="w-full max-w-2xl"
              >
                {renderMode !== 'long' ? (
                  (() => {
                    const pages = splitMarkdown(mdString, renderMode);
                    return pages.map((pageContent, index) => (
                      <Preview 
                        key={index}
                        content={pageContent} 
                        index={index} 
                        total={pages.length}
                      />
                    ));
                  })()
                ) : (
                  <div className={currentTheme.background}>
                    <Preview content={mdString} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 使用说明 */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <p className="text-sm text-gray-500">
          {renderMode === 'manual-pagination' ? (
            '提示：在手动分页模式下，使用 "---" 来分割页面，点击下载将保存所有页面'
          ) : renderMode === 'auto-pagination' ? (
            '提示：在自动分页模式下，会按标题自动分页，点击下载将保存所有页面'
          ) : (
            '提示：长图模式下将生成并下载单张完整图片'
          )}
        </p>
      </div>
    </div>
  );
}