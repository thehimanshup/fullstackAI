"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UploadCloud, CheckCircle, FileText, Image as ImageIcon, BookOpen, Sparkles, X } from "lucide-react"
import { evaluateDocument } from "./actions"

export default function EvaluatorPage() {
    const [studentFile, setStudentFile] = useState<File | null>(null)
    const [markingSchemeFile, setMarkingSchemeFile] = useState<File | null>(null)
    const [rubric, setRubric] = useState("")
    const [useFileScheme, setUseFileScheme] = useState(false)
    const [evaluation, setEvaluation] = useState("")
    const [isEvaluating, setIsEvaluating] = useState(false)
    const studentFileRef = useRef<HTMLInputElement>(null)
    const schemeFileRef = useRef<HTMLInputElement>(null)

    const handleStudentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setStudentFile(e.target.files[0])
    }

    const handleSchemeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setMarkingSchemeFile(e.target.files[0])
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result.split(",")[1])
                } else {
                    reject("Failed to read file as base64")
                }
            }
            reader.onerror = error => reject(error)
        })
    }

    const FileIcon = ({ file }: { file: File }) =>
        file.type.includes("pdf")
            ? <FileText className="w-8 h-8 text-blue-400" />
            : <ImageIcon className="w-8 h-8 text-pink-400" />

    const handleEvaluate = async () => {
        if (!studentFile) {
            alert("Please upload the student's answer document.")
            return
        }
        if (useFileScheme && !markingSchemeFile) {
            alert("Please upload the marking scheme file.")
            return
        }
        if (!useFileScheme && !rubric.trim()) {
            alert("Please provide a rubric or switch to marking scheme file mode.")
            return
        }

        setIsEvaluating(true)
        try {
            const base64Data = await fileToBase64(studentFile)
            let schemeBase64: string | undefined
            let schemeMime: string | undefined

            if (useFileScheme && markingSchemeFile) {
                schemeBase64 = await fileToBase64(markingSchemeFile)
                schemeMime = markingSchemeFile.type
            }

            const result = await evaluateDocument(
                base64Data,
                studentFile.type,
                rubric,
                schemeBase64,
                schemeMime
            )
            setEvaluation(result)
        } catch (error) {
            console.error(error)
            alert("Failed to evaluate the document. Make sure it's a valid PDF or Image.")
        } finally {
            setIsEvaluating(false)
        }
    }

    const canEvaluate = studentFile && (useFileScheme ? !!markingSchemeFile : rubric.trim().length > 0)

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    Rubric Evaluator
                </h1>
                <p className="text-muted-foreground">AI-powered document grading — compare against a marking scheme or text rubric</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Panel — Upload & Setup */}
                <div className="space-y-4">
                    {/* Student Answer Upload */}
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">STEP 1</span>
                                Student's Answer Document
                            </CardTitle>
                            <CardDescription>Upload the student's answer sheet (PDF or image)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors bg-white/5 group"
                                onClick={() => studentFileRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={studentFileRef}
                                    onChange={handleStudentFile}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                />
                                {studentFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileIcon file={studentFile} />
                                        <p className="text-gray-200 font-medium text-sm">{studentFile.name}</p>
                                        <p className="text-xs text-gray-400">{(studentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setStudentFile(null) }}
                                            className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                        <p className="text-gray-200 font-medium text-sm">Click to upload student answer</p>
                                        <p className="text-xs text-gray-400">PDF, JPG, PNG supported</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evaluation Method Toggle */}
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">STEP 2</span>
                                Evaluation Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Toggle */}
                            <div className="flex rounded-lg overflow-hidden border border-white/10">
                                <button
                                    onClick={() => setUseFileScheme(false)}
                                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${!useFileScheme ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    📝 Type Rubric
                                </button>
                                <button
                                    onClick={() => setUseFileScheme(true)}
                                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${useFileScheme ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    📄 Upload Marking Scheme
                                </button>
                            </div>

                            {!useFileScheme ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-200">Evaluation Rubric</label>
                                    <textarea
                                        value={rubric}
                                        onChange={(e) => setRubric(e.target.value)}
                                        rows={6}
                                        placeholder={"E.g.:\n1. Clarity (10 marks)\n2. Accuracy (10 marks)\n3. Presentation (5 marks)\n\nLook for keywords like 'Momentum', 'Force'..."}
                                        className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-medium text-gray-200 mb-2 block">Marking Scheme / Answer Key</label>
                                    <div
                                        className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors bg-white/5 group"
                                        onClick={() => schemeFileRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={schemeFileRef}
                                            onChange={handleSchemeFile}
                                            className="hidden"
                                            accept="image/*,application/pdf"
                                        />
                                        {markingSchemeFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileIcon file={markingSchemeFile} />
                                                <p className="text-gray-200 font-medium text-sm">{markingSchemeFile.name}</p>
                                                <p className="text-xs text-gray-400">{(markingSchemeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setMarkingSchemeFile(null) }}
                                                    className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                                <p className="text-gray-200 font-medium text-sm">Upload teacher's marking scheme</p>
                                                <p className="text-xs text-gray-400">The AI will compare student work against this</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Additional notes / criteria (optional)</label>
                                        <textarea
                                            value={rubric}
                                            onChange={(e) => setRubric(e.target.value)}
                                            rows={3}
                                            placeholder="Any additional grading instructions..."
                                            className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleEvaluate}
                                className="w-full"
                                disabled={isEvaluating || !canEvaluate}
                                variant="premium"
                            >
                                {isEvaluating ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Evaluating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Evaluate Document
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel — Results */}
                <Card className="bg-black/40 border-white/10 overflow-hidden flex flex-col min-h-[600px]">
                    <CardHeader className="bg-black/20 border-b border-white/5">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            AI Evaluation Results
                        </CardTitle>
                        {useFileScheme && markingSchemeFile && (
                            <p className="text-xs text-purple-400 mt-1">
                                ✓ Using marking scheme: {markingSchemeFile.name}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6">
                        {isEvaluating ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                                <p className="text-gray-400 text-sm">AI is analysing the document...</p>
                            </div>
                        ) : evaluation ? (
                            <div
                                className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: evaluation.replace(/\n/g, '<br/>') }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 italic py-20 text-center gap-3">
                                <CheckCircle className="h-12 w-12 text-white/10" />
                                <p>Upload a student document and provide<br />a rubric or marking scheme to see AI feedback here...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
