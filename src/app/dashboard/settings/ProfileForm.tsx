"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateProfile, changePassword, deleteAccount } from "./actions"
import { signOut } from "next-auth/react"
import { Save, KeyRound, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileFormProps {
    defaultName: string
    defaultPhone: string
    defaultLanguage: string
    userEmail: string
}

export function ProfileForm({ defaultName, defaultPhone, defaultLanguage, userEmail }: ProfileFormProps) {
    const router = useRouter()

    // Profile state
    const [name, setName] = useState(defaultName || "")
    const [phone, setPhone] = useState(defaultPhone || "")
    const [language, setLanguage] = useState(defaultLanguage || "English")
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Password state
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        setProfileMsg(null)
        try {
            await updateProfile({ name, phone, language })
            setProfileMsg({ type: "success", text: "Profile updated successfully!" })
            router.refresh()
        } catch (error: any) {
            setProfileMsg({ type: "error", text: error.message || "Failed to update profile" })
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleChangePassword = async () => {
        setPasswordMsg(null)
        if (newPassword !== confirmNewPassword) {
            setPasswordMsg({ type: "error", text: "New passwords do not match." })
            return
        }
        if (newPassword.length < 6) {
            setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." })
            return
        }

        setIsSavingPassword(true)
        try {
            await changePassword(currentPassword, newPassword)
            setPasswordMsg({ type: "success", text: "Password changed successfully!" })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
        } catch (error: any) {
            setPasswordMsg({ type: "error", text: error.message || "Failed to change password" })
        } finally {
            setIsSavingPassword(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return
        setIsDeleting(true)
        try {
            await deleteAccount()
            await signOut({ redirect: false })
            router.push("/")
        } catch (error: any) {
            alert(error.message || "Failed to delete account")
            setIsDeleting(false)
        }
    }

    const MessageBanner = ({ msg }: { msg: { type: "success" | "error"; text: string } }) => (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${msg.type === "success"
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
            {msg.type === "success" ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
            {msg.text}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Personal Information</CardTitle>
                    <CardDescription>Update your name, phone, and preferred language</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Email (cannot be changed)</label>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm">
                            {userEmail || "Not set"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            placeholder="Your full name"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Phone Number</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            placeholder="+91 9876543210"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Preferred Language</label>
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Bengali">Bengali</option>
                        </select>
                    </div>
                    {profileMsg && <MessageBanner msg={profileMsg} />}
                    <Button variant="premium" onClick={handleSaveProfile} disabled={isSavingProfile} className="flex items-center gap-2">
                        {isSavingProfile ? (
                            <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Saving...</>
                        ) : (
                            <><Save className="h-4 w-4" />Save Profile</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <KeyRound className="h-4 w-4" /> Change Password
                    </CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            placeholder="At least 6 characters"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    {passwordMsg && <MessageBanner msg={passwordMsg} />}
                    <Button
                        variant="outline"
                        onClick={handleChangePassword}
                        disabled={isSavingPassword || !currentPassword || !newPassword}
                        className="flex items-center gap-2"
                    >
                        {isSavingPassword ? (
                            <><span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />Updating...</>
                        ) : (
                            <><KeyRound className="h-4 w-4" />Update Password</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-500/20">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-red-400">
                        <Trash2 className="h-4 w-4" /> Delete Account
                    </CardTitle>
                    <CardDescription>Permanently delete your account and all data. This cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showDeleteConfirm ? (
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete My Account
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 font-medium flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4" /> This action is permanent and cannot be reversed.
                                </p>
                                <p className="text-sm text-gray-400">All your progress, attempts, and data will be permanently deleted.</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-300">
                                    Type <span className="font-bold text-red-400">DELETE</span> to confirm
                                </label>
                                <input
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-white/5 border border-red-500/30 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
                                    placeholder="Type DELETE here"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                                    className="flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Deleting...</>
                                    ) : (
                                        <><Trash2 className="h-4 w-4" />Yes, Delete Forever</>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText("") }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
