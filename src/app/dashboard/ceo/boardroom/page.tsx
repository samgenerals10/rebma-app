'use client'
import { useState, useEffect, useRef } from 'react'
import { Video, Mic, MicOff, VideoOff, Users, PhoneOff, Share, ShieldAlert, MessageCircle, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BoardroomPage() {
  const [isMeetingActive, setIsMeetingActive] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [user, setUser] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user: auth } } = await supabase.auth.getUser()
    if (auth) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', auth.id).single()
      setUser(userData)
    }
  }

  const startMeeting = async () => {
    // In a real app, this would connect to the meeting-server.js
    // and broadcast a notification to all staff
    setIsMeetingActive(true)
    setParticipants([
      { name: 'John (Finance)', active: true, role: 'manager' },
      { name: 'Sarah (Ops)', active: true, role: 'supervisor' }
    ])

    // Request camera access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera error:", err)
    }

    // Send notification to everyone
    await supabase.from('notifications').insert({
      title: 'CEO has opened the Boardroom',
      body: 'All department heads and staff are requested to join for a live update.',
      type: 'meeting_invite',
      reference_id: 'ceo-boardroom',
      recipient_department: 'all'
    })
  }

  const endMeeting = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsMeetingActive(false)
    setParticipants([])
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            CEO Executive Boardroom
          </h1>
          <p className="text-sm text-gray-500">Secure end-to-end encrypted virtual headquarters.</p>
        </div>
        {!isMeetingActive ? (
          <button onClick={startMeeting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            <Video className="w-5 h-5" /> Start Live Meeting
          </button>
        ) : (
          <button onClick={endMeeting} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2">
            <PhoneOff className="w-5 h-5" /> End Session
          </button>
        )}
      </div>

      {isMeetingActive ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Stage */}
          <div className="lg:col-span-3 bg-gray-900 rounded-3xl overflow-hidden relative group shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* HUD Overlay */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
              </div>
              <div className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
                REBMA GLOBAL BOARDROOM
              </div>
            </div>

            {/* Controls Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <button onClick={() => setMicEnabled(!micEnabled)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${micEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'}`}>
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button onClick={() => setVideoEnabled(!videoEnabled)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${videoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'}`}>
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <button className="w-12 h-12 rounded-xl bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition">
                <Share className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-xl bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button onClick={endMeeting} className="w-12 h-12 rounded-xl bg-red-600 text-white hover:bg-red-500 flex items-center justify-center transition">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar Participants */}
          <div className="space-y-4 flex flex-col">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Participants
                </h3>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {participants.length + 1}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {/* Self */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user?.full_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-900">You (CEO)</p>
                      <p className="text-[10px] text-indigo-500">Host</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-indigo-400" />
                    <Video className="w-3 h-3 text-indigo-400" />
                  </div>
                </div>
                {/* Others */}
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{p.name}</p>
                        <p className="text-[10px] text-gray-500 capitalize">{p.role}</p>
                      </div>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 mt-4">
                <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg transition">
                  Invite Department...
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">The Boardroom is currently empty</h2>
          <p className="text-gray-500 max-w-sm mb-8 text-sm">
            Start a meeting to connect live with your staff. When you start a session, an invitation will be sent to the relevant departments.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="p-4 rounded-2xl bg-gray-50 text-left border border-gray-100">
              <ShieldAlert className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-gray-900">Encrypted Line</p>
              <p className="text-[10px] text-gray-500 mt-1">Direct WebRTC secure peer-to-peer connection.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 text-left border border-gray-100">
              <Users className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-gray-900">Broadcast Mode</p>
              <p className="text-[10px] text-gray-500 mt-1">Easily push notifications to entire departments.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
