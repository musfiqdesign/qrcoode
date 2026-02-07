'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { QrCode, FileImage, FileCode, FileText, Facebook, Mail, ExternalLink, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const jsPDF = dynamic(() => import('jspdf'), { ssr: false })

type ContentType = 'url' | 'text' | 'wifi' | 'vcard'
type DotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'classy-dot'
type CornerType = 'square' | 'dot' | 'extra-rounded'
type CornerDotType = 'square' | 'dot' | 'rounded'
type QRCodeStylingType = any

const createQRCodeInstance = async () => {
  const QRCodeStyling = (await import('qr-code-styling')).default
  return new QRCodeStyling({
    width: 300,
    height: 300,
    type: 'svg',
    data: '',
    image: '',
    dotsOptions: {
      color: '#000000',
      type: 'square',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    cornersSquareOptions: {
      type: 'square',
      color: '#000000',
    },
    cornersDotOptions: {
      type: 'square',
      color: '#000000',
    },
  })
}

export default function Home() {
  const [qrCodeInstance, setQRCodeInstance] = useState<QRCodeStylingType | null>(null)
  const [contentType, setContentType] = useState<ContentType>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiType, setWifiType] = useState('WPA')
  
  const [vcardName, setVcardName] = useState('')
  const [vcardPhone, setVcardPhone] = useState('')
  const [vcardEmail, setVcardEmail] = useState('')
  const [vcardOrg, setVcardOrg] = useState('')
  
  const [qrColor, setQrColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [dotType, setDotType] = useState<DotType>('square')
  const [cornerType, setCornerType] = useState<CornerType>('square')
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square')
  const [resolution, setResolution] = useState<number>(3000)
  const [logo, setLogo] = useState<string>('')
  
  const qrRef = useRef<HTMLDivElement>(null)

  const getQRData = () => {
    switch (contentType) {
      case 'url':
        return url
      case 'text':
        return text
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiSSID};P:${wifiPassword};;`
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardName}
TEL:${vcardPhone}
EMAIL:${vcardEmail}
ORG:${vcardOrg}
END:VCARD`
      default:
        return ''
    }
  }

  const updateQRCode = () => {
    if (!qrCodeInstance) return
    
    const data = getQRData()
    if (!data) return

    const options = {
      data,
      width: 300,
      height: 300,
      type: 'svg',
      image: logo || undefined,
      dotsOptions: {
        color: qrColor,
        type: dotType,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornerType,
        color: qrColor,
      },
      cornersDotOptions: {
        type: cornerDotType,
        color: qrColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 20,
      },
    }

    qrCodeInstance.update(options)
  }

  // Initialize QR Code instance on client-side only
  // This is necessary because QRCodeStyling requires window object
  useEffect(() => {
    const initQRCode = async () => {
      const instance = await createQRCodeInstance()
      setQRCodeInstance(instance)
    }
    initQRCode()
  }, [])

  useEffect(() => {
    if (qrCodeInstance) {
      updateQRCode()
    }
  }, [contentType, url, text, wifiSSID, wifiPassword, wifiType, vcardName, vcardPhone, vcardEmail, vcardOrg, qrColor, bgColor, dotType, cornerType, cornerDotType, logo, qrCodeInstance])

  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (qrCodeRef.current && qrCodeInstance) {
      qrCodeRef.current.innerHTML = ''
      qrCodeInstance.append(qrCodeRef.current)
    }
  }, [qrCodeInstance])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogo(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadQRCode = async (format: 'png' | 'svg' | 'pdf') => {
    if (!qrCodeInstance) {
      alert('QR Code not initialized. Please wait a moment.')
      return
    }
    
    const data = getQRData()
    if (!data) {
      alert('Please enter content first')
      return
    }

    try {
      // Create a temporary QR code instance for download to get maximum quality
      const QRCodeStyling = (await import('qr-code-styling')).default
      const downloadQR = new QRCodeStyling({
        width: resolution,
        height: resolution,
        type: format === 'pdf' ? 'png' : format,
        data,
        image: logo || undefined,
        dotsOptions: {
          color: qrColor,
          type: dotType,
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: cornerType,
          color: qrColor,
        },
        cornersDotOptions: {
          type: cornerDotType,
          color: qrColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 20,
        },
      })

      if (format === 'pdf') {
        // For PDF, generate high-DPI image
        const blob = await downloadQR.getRawData('png')
        if (blob) {
          const { default: jsPDFClass } = await import('jspdf')
          const pdf = new jsPDFClass({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          })
          
          const imgData = URL.createObjectURL(blob)
          const img = new Image()
          img.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = 120
            const imgHeight = 120
            const x = (pdfWidth - imgWidth) / 2
            const y = 70
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST')
            pdf.setFontSize(20)
            pdf.text('QR Code', pdfWidth / 2, y + imgHeight + 20, { align: 'center' })
            pdf.setFontSize(12)
            pdf.text(`Content: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`, pdfWidth / 2, y + imgHeight + 35, { align: 'center' })
            pdf.save('qrcode.pdf')
            URL.revokeObjectURL(imgData)
          }
          img.src = imgData
        }
      } else {
        // For PNG and SVG, download directly from temporary instance
        await downloadQR.download({ name: 'qrcode', extension: format })
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Error downloading QR code. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-safe overflow-x-hidden relative">
      {/* Modern Light Creative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient - clean and modern light */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100" />

        {/* Single large creative gradient blob - light and airy */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-br from-blue-400/10 via-cyan-400/8 to-violet-400/6 rounded-[30%] blur-[120px] animate-[breathe_15s_ease-in-out_infinite]" />

        {/* Subtle minimal circles - geometric and clean */}
        <div className="absolute top-[15%] right-[20%] w-64 h-64 border border-blue-200/20 rounded-full animate-[rotate_30s_linear_infinite]" />
        <div className="absolute top-[25%] right-[25%] w-48 h-48 border border-cyan-200/20 rounded-full animate-[rotate_40s_linear_infinite_reverse]" />
        <div className="absolute bottom-[20%] left-[15%] w-56 h-56 border border-violet-200/15 rounded-full animate-[rotate_35s_linear_infinite]" />

        {/* Very subtle dot grid - adds texture without distraction */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        {/* Two elegant gradient lines - creative minimal accent */}
        <div className="absolute top-[30%] left-[10%] w-[2px] h-[15%] bg-gradient-to-b from-transparent via-blue-300/20 to-transparent" />
        <div className="absolute bottom-[30%] right-[10%] w-[2px] h-[12%] bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />
      </div>

      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <header className="py-4 sm:py-6 px-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 w-full max-w-full relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex-shrink-0 shadow-lg shadow-blue-500/20">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              QR Code Generator
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Create beautiful QR codes instantly</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-lime-500 to-green-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 rounded-full"></div>
              <div className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 via-lime-500 to-green-600 rounded-full shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/60 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Free
                  </span>
                  <span className="text-white/40 font-light">|</span>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Unlimited
                  </span>
                  <span className="text-white/40 font-light">|</span>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    Hassle-free
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 w-full min-w-0">
            {/* Left Panel - Input & Options */}
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Content Type Selection */}
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-slate-800">Content Type</CardTitle>
                  <CardDescription className="text-slate-500">Choose what type of QR code you want to create</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-12">
                      <TabsTrigger value="url" className="text-xs sm:text-sm">URL</TabsTrigger>
                      <TabsTrigger value="text" className="text-xs sm:text-sm">Text</TabsTrigger>
                      <TabsTrigger value="wifi" className="text-xs sm:text-sm">WiFi</TabsTrigger>
                      <TabsTrigger value="vcard" className="text-xs sm:text-sm">VCard</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-4 mt-4 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <Label htmlFor="url" className="text-sm sm:text-base">Website URL</Label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="space-y-4 mt-4 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <Label htmlFor="text" className="text-sm sm:text-base">Text Content</Label>
                        <textarea
                          id="text"
                          placeholder="Enter your text here..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="mt-2 w-full min-w-0 min-h-[120px] px-4 py-3 border border-slate-200 rounded-md resize-none text-base bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="wifi" className="space-y-4 mt-4 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <Label htmlFor="ssid" className="text-sm sm:text-base">Network Name (SSID)</Label>
                        <Input
                          id="ssid"
                          placeholder="WiFi Name"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="WiFi Password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label htmlFor="type" className="text-sm sm:text-base">Security Type</Label>
                        <Select value={wifiType} onValueChange={setWifiType}>
                          <SelectTrigger className="mt-2 h-12 text-base max-w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA" className="text-base">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP" className="text-base">WEP</SelectItem>
                            <SelectItem value="nopass" className="text-base">No Password</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="vcard" className="space-y-4 mt-4 w-full min-w-0">
                      <div className="w-full min-w-0">
                        <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={vcardName}
                          onChange={(e) => setVcardName(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={vcardPhone}
                          onChange={(e) => setVcardPhone(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={vcardEmail}
                          onChange={(e) => setVcardEmail(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <Label htmlFor="org" className="text-sm sm:text-base">Organization</Label>
                        <Input
                          id="org"
                          placeholder="Company Name"
                          value={vcardOrg}
                          onChange={(e) => setVcardOrg(e.target.value)}
                          className="mt-2 h-12 text-base max-w-full"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Styling Options */}
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-slate-800">Styling Options</CardTitle>
                  <CardDescription className="text-slate-500">Customize the appearance of your QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Color Options */}
                  <div className="space-y-4 w-full min-w-0">
                    <div>
                      <Label htmlFor="qrColor">QR Code Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="qrColor"
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bgColor">Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="bgColor"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resolution / Quality */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="resolution">Image Resolution</Label>
                      <span className="text-sm font-medium text-gray-700">{resolution}x{resolution}px</span>
                    </div>
                    <Slider
                      id="resolution"
                      min={1000}
                      max={4000}
                      step={100}
                      value={[resolution]}
                      onValueChange={(value) => setResolution(value[0])}
                      className="mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Higher resolution = crystal clear print quality (Default: 3000x3000px, Max: 4000x4000px)
                    </p>
                  </div>

                  {/* Shape Options */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dotType">Dot Style</Label>
                      <Select value={dotType} onValueChange={(v) => setDotType(v as DotType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="dots">Dots</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                          <SelectItem value="classy">Classy</SelectItem>
                          <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                          <SelectItem value="classy-dot">Classy Dot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cornerType">Corner Frame</Label>
                      <Select value={cornerType} onValueChange={(v) => setCornerType(v as CornerType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                          <SelectItem value="dot">Dot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cornerDotType">Corner Dot</Label>
                      <Select value={cornerDotType} onValueChange={(v) => setCornerDotType(v as CornerDotType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="dot">Dot</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label htmlFor="logo">Custom Logo (Optional)</Label>
                    <div className="mt-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                      {logo && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded" />
                          <span className="text-sm text-slate-600">Logo uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Preview & Export */}
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <Card className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/50 lg:sticky lg:top-4 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-800 text-base sm:text-lg">Live Preview</CardTitle>
                  <CardDescription className="text-slate-500 text-sm">See your QR code update in real-time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* QR Code Preview */}
                  <div className="flex justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-inner overflow-hidden border border-slate-200">
                    <div ref={qrCodeRef} className="flex items-center justify-center max-w-full" />
                  </div>

                  {/* Export Buttons */}
                  <div className="space-y-3 w-full min-w-0">
                    <Label className="text-sm sm:text-base">Download Options</Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <Button
                        onClick={() => downloadQRCode('png')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 sm:h-10 text-sm sm:text-base"
                      >
                        <FileImage className="w-4 h-4 mr-1 sm:mr-2" />
                        <span>PNG</span>
                      </Button>
                      <Button
                        onClick={() => downloadQRCode('svg')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 sm:h-10 text-sm sm:text-base"
                      >
                        <FileCode className="w-4 h-4 mr-1 sm:mr-2" />
                        <span>SVG</span>
                      </Button>
                      <Button
                        onClick={() => downloadQRCode('pdf')}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 sm:h-10 text-sm sm:text-base"
                      >
                        <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                        <span>PDF</span>
                      </Button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-lg border border-blue-200">
                    <p className="text-sm text-slate-700">
                      💡 <strong>Tip:</strong> Add a logo to make your QR code branded. 
                      Higher contrast between foreground and background colors improves scannability.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-lg mt-auto w-full max-w-full overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full min-w-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left min-w-0">
              <span className="text-base sm:text-lg font-semibold text-slate-700 flex-shrink-0">Developed with</span>
              <span className="text-red-500 text-lg sm:text-xl flex-shrink-0">❤️</span>
              <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                by Musfiqur Rahman
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="https://www.facebook.com/musfiq.design"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#1877F2] hover:bg-[#0d65c1] text-white rounded-lg transition-colors text-xs sm:text-sm shadow-md shadow-blue-500/20"
              >
                <Facebook className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Facebook</span>
              </a>
              
              <a
                href="https://www.behance.net/musfiqgfx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#1769FF] hover:bg-[#0d4ad3] text-white rounded-lg transition-colors text-xs sm:text-sm shadow-md shadow-blue-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Portfolio</span>
              </a>
              
              <a
                href="mailto:musfiqgfx@gmail.com"
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white rounded-lg transition-colors text-xs sm:text-sm shadow-md shadow-slate-500/20"
              >
                <Mail className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Email</span>
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-slate-500">
            Unlimited QR Code Generator • Create professional QR codes for any purpose
          </div>
        </div>
      </footer>
    </div>
  )
}
