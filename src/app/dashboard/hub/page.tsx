"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, FileText, Download, Search, PlaySquare, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { generateNotes, searchResources, getStudyLibrary } from "./actions"
import ReactMarkdown from "react-markdown"

export default function AcademicHubPage() {
    const [topic, setTopic] = useState("")
    const [notes, setNotes] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<"notes" | "search" | "library">("notes")
    const notesRef = useRef<HTMLDivElement>(null)

    // Search state
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{title: string, type: string, url: string}[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Library state
    const [library, setLibrary] = useState<Record<string, {subject: string, files: string[]}[]>>({})
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }))
    }

    // Fetch library once on load
    useEffect(() => {
        setIsLoadingLibrary(true)
        getStudyLibrary().then(data => {
            setLibrary(data)
            setIsLoadingLibrary(false)
        })
    }, [])

    const handleGenerateNotes = async () => {
        if (!topic.trim()) return
        setIsGenerating(true)
        try {
            const aiNotes = await generateNotes(topic)
            setNotes(aiNotes)
        } catch (error) {
            alert("Failed to generate notes")
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadPDF = async () => {
        if (!notesRef.current) return
        const canvas = await html2canvas(notesRef.current, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${topic.replace(/\s+/g, '_')}_Notes.pdf`)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Academic Hub
                </h1>
                <p className="text-muted-foreground">AI Smart Notes & Material Search</p>
            </div>

            <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                <Button 
                    variant={activeTab === "notes" ? "default" : "ghost"} 
                    onClick={() => setActiveTab("notes")}
                    className="gap-2 shrink-0"
                >
                    <FileText className="w-4 h-4" /> AI Smart Notes
                </Button>
                <Button 
                    variant={activeTab === "search" ? "default" : "ghost"} 
                    onClick={() => setActiveTab("search")}
                    className="gap-2 shrink-0"
                >
                    <Search className="w-4 h-4" /> Resource Search
                </Button>
                <Button 
                    variant={activeTab === "library" ? "default" : "ghost"} 
                    onClick={() => setActiveTab("library")}
                    className="gap-2 shrink-0"
                >
                    <BookOpen className="w-4 h-4" /> Study Library
                </Button>
            </div>

            {activeTab === "notes" && (
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 bg-black/40 border-white/10">
                        <CardHeader>
                            <CardTitle>Generate Notes</CardTitle>
                            <CardDescription>Enter a topic to get curriculum-aligned markdown notes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <input
                                type="text"
                                placeholder="e.g. Thermodynamics, Photosynthesis"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <Button 
                                onClick={handleGenerateNotes} 
                                className="w-full" 
                                disabled={isGenerating || !topic.trim()}
                                variant="premium"
                            >
                                {isGenerating ? "Generating..." : "Generate Smart Notes"}
                            </Button>

                            {notes && (
                                <Button 
                                    onClick={downloadPDF} 
                                    className="w-full mt-4" 
                                    variant="outline"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Export PDF
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 bg-black/40 border-white/10 min-h-[500px]">
                        <CardHeader>
                            <CardTitle>Notes Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notes ? (
                                <div 
                                    ref={notesRef} 
                                    className="prose prose-invert max-w-none p-6 bg-black/80 rounded-lg"
                                >
                                    <ReactMarkdown>{notes}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 italic py-20">
                                    Your generated notes will appear here...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "search" && (
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle>Resource Search</CardTitle>
                        <CardDescription>Discover latest board papers, supplementary books, and videos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search for Sample Papers or Books..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <Button 
                                variant="premium" 
                                onClick={async () => {
                                    if (!searchQuery.trim()) return
                                    setIsSearching(true)
                                    const results = await searchResources(searchQuery)
                                    setSearchResults(results)
                                    setIsSearching(false)
                                }}
                                disabled={isSearching || !searchQuery.trim()}
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {searchResults.length > 0 ? (
                                searchResults.map((item, idx) => (
                                    <Card key={idx} className="bg-white/5 border-white/10">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            {item.type.toLowerCase().includes('video') ? <PlaySquare className="w-8 h-8 text-red-400" /> : <FileText className="w-8 h-8 text-blue-400" />}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white truncate">{item.title}</h3>
                                                <p className="text-sm text-gray-400">{item.type}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="ml-auto" asChild>
                                                <a href={item.url} target="_blank" rel="noreferrer">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic col-span-full text-center py-8">
                                    {isSearching ? "Finding resources on the internet..." : "Enter a search query to find resources."}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "library" && (
                <Card className="bg-black/40 border-white/10">
                    <CardHeader>
                        <CardTitle>Study Library (Class 10th)</CardTitle>
                        <CardDescription>Previous year question papers organized by subject and year.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {isLoadingLibrary ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading library...</div>
                        ) : Object.keys(library).length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No study materials found in the library.</div>
                        ) : (
                            Object.entries(library).map(([year, subjects]) => (
                                <div key={year} className="space-y-4">
                                    <h3 className="text-xl font-bold border-b border-white/10 pb-2">{year}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {subjects.map((subj, sIdx) => {
                                            const folderId = `${year}-${subj.subject}`
                                            const isExpanded = expandedFolders[folderId]
                                            const displaySubject = subj.subject === "General" ? "Miscellaneous" : subj.subject.replace(/_/g, ' ')
                                            
                                            return (
                                                <div key={sIdx} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all duration-300">
                                                    <button 
                                                        onClick={() => toggleFolder(folderId)}
                                                        className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? (
                                                                <FolderOpen className="w-6 h-6 text-yellow-400" />
                                                            ) : (
                                                                <Folder className="w-6 h-6 text-yellow-400" />
                                                            )}
                                                            <span className="font-semibold text-gray-200">{displaySubject}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground bg-black/40 px-2 py-1 rounded-full">
                                                                {subj.files.length} files
                                                            </span>
                                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div className="p-3 bg-black/20 space-y-2 border-t border-white/10 max-h-64 overflow-y-auto">
                                                            {subj.files.map((file, fIdx) => (
                                                                <a 
                                                                    key={fIdx} 
                                                                    href={`/api/download?path=${year}${subj.subject !== 'General' ? '/' + subj.subject : ''}/${file}`}
                                                                    download
                                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                                                >
                                                                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                                                    <span className="text-xs truncate flex-1 text-gray-400 group-hover:text-white">
                                                                        {file}
                                                                    </span>
                                                                    <Download className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
