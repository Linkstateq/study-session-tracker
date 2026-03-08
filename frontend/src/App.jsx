// Main frontend file for the Study Session Tracker application.
// This component handles the UI, user interactions, and communication
// with the backend API that stores study session data.
import { useState, useEffect, useRef } from "react"
import { Bar } from "react-chartjs-2"

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Tooltip,
Legend
} from "chart.js"

import {
BookOpen,
Calendar,
TrendingUp,
Clock,
ListFilter
} from "lucide-react"

// Registering required Chart.js components so the bar chart can render properly
// inside the analytics section of the application.
ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Tooltip,
Legend
)

// Main React component of the application.
// All state variables, functions, and UI layout are defined here.
function App(){

// Base URL of the backend API server.
// All requests for sessions (add, delete, update, fetch) go through this endpoint.
const API="http://localhost:3000"

// Default subjects shown in the dropdown.
// These appear even if the user has not added any sessions yet.
const defaultSubjects=["Math","Programming","Physics"]

// Application state variables.
// These keep track of sessions, form inputs, filters,
// and editing states used across the UI.
const [sessions,setSessions]=useState([])
const [subjects,setSubjects]=useState(defaultSubjects)

const [subject,setSubject]=useState("")
const [customSubject,setCustomSubject]=useState("")
const [duration,setDuration]=useState("")
const [date,setDate]=useState("")
const [productivity,setProductivity]=useState(0)

const [editingId,setEditingId]=useState(null)

const [filterSubject,setFilterSubject]=useState("All")
const [summaryFilter,setSummaryFilter]=useState("All")
const [openMenuId,setOpenMenuId]=useState(null)

// This effect closes the mobile action menu when the user clicks anywhere
// outside the menu. Without this, the dropdown would stay open.
useEffect(()=>{
    function handleClick(){
    setOpenMenuId(null)
    }
    
    window.addEventListener("click",handleClick)
    
    return ()=>window.removeEventListener("click",handleClick)
    
    },[])

// References used for smooth scrolling navigation
// between the dashboard and analytics sections.
const dashboardRef=useRef(null)
const analyticsRef=useRef(null)

// Runs once when the component loads.
// It fetches existing study sessions from the backend.
useEffect(()=>{
loadSessions()
},[])

// Fetches all stored sessions from the backend database
// and updates the frontend state with the retrieved data.
function loadSessions(){

fetch(API+"/sessions")
.then(res=>res.json())
.then(data=>{

setSessions(data)

// Extract subjects already used in sessions so they appear
// in the dropdown together with the default subjects.
const existing=[
...new Set(data.map(s=>s.subject))
]

setSubjects([
...new Set([...defaultSubjects,...existing])
])

})

}

// Clears all form fields after a session is added or updated.
function resetForm(){
setSubject("")
setCustomSubject("")
setDuration("")
setDate("")
setProductivity(0)
}

// Formats subject names so they look consistent.
// Example: "math" becomes "Math".
function normalizeSubject(name){
name=name.trim()
return name.charAt(0).toUpperCase()+name.slice(1).toLowerCase()
}

// Handles adding a new study session or updating an existing one.
// If editingId exists, it updates the session.
// Otherwise it creates a new session in the database.
async function addSession(e){

    e.preventDefault()
    
    let finalSubject = subject === "Other" ? customSubject : subject

    // Basic validation: prevent submitting empty session data.
    if(!finalSubject || !duration || !date) return
    
    finalSubject = normalizeSubject(finalSubject)
    
    const payload={
    subject:finalSubject,
    duration,
    date,
    productivity
    }
    
    // If editing mode is active, update the existing session instead of creating a new one.
    if(editingId){
    
    await fetch(API+"/sessions/"+editingId,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
    })
    
    /* update local state immediately */
    
    setSessions(prev =>
    prev.map(session =>
    session.id === editingId
    ? { ...session, ...payload }
    : session
    )
    )
    
    setEditingId(null)
    resetForm()
    
    }else{
    
    await fetch(API+"/sessions",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
    })
    
    loadSessions()
    
    resetForm()
    
    }
    
    }

// Deletes a session from the backend using its ID
// and refreshes the session list afterwards.
function deleteSession(id){

fetch(API+"/sessions/"+id,{
method:"DELETE"
}).then(()=>loadSessions())

}

// Loads an existing session into the form so the user can edit it.
function startEdit(session){

    setEditingId(session.id)
    
    if(defaultSubjects.includes(session.subject)){
    setSubject(session.subject)
    setCustomSubject("")
    }else{
    setSubject("Other")
    setCustomSubject(session.subject)
    }
    
    setDuration(session.duration)
    setDate(session.date)
    setProductivity(session.productivity)

    // Scroll back to the form so the user can see the edit fields.
    dashboardRef.current.scrollIntoView({behavior:"smooth"})
    
    }

// Filters sessions for the table based on the selected subject.
const filteredSessions=
filterSubject==="All"
? sessions
: sessions.filter(s=>s.subject===filterSubject)

// Filters sessions used in the summary statistics section.
const summarySessions=
summaryFilter==="All"
? sessions
: sessions.filter(s=>s.subject===summaryFilter)

// Calculations used for the Study Summary section.
const totalSessions=summarySessions.length

const totalHours=summarySessions.reduce(
(sum,s)=>sum+Number(s.duration||0),0
)

const avgProductivity=
summarySessions.length>0
?(
summarySessions.reduce((sum,s)=>sum+Number(s.productivity||0),0)
/summarySessions.length
).toFixed(1)
:0

// Converts numeric productivity rating into star symbols for display.
function renderStars(value){
const full=Math.floor(value)
let stars=""
for(let i=0;i<full;i++) stars+="★"
return stars
}

// Prepare data for the analytics bar chart showing
// total study hours per subject.
const subjectTotals=subjects.map(sub=>
sessions
.filter(s=>s.subject===sub)
.reduce((sum,s)=>sum+Number(s.duration||0),0)
)

const maxValue=Math.max(...subjectTotals,1)

const chartColors=subjectTotals.map(v=>
v===maxValue ? "#3b82f6" : "#cbd5e1"
)

// Chart.js dataset configuration for the analytics graph.
const chartData={
labels:subjects,
datasets:[{
data:subjectTotals,
backgroundColor:chartColors,
borderRadius:6
}]
}

const chartOptions={
responsive:true,
maintainAspectRatio:false,
plugins:{legend:{display:false}},
scales:{y:{beginAtZero:true}}
}

// UI layout of the application.
// Includes dashboard, session logging form, summary statistics,
// session table, and analytics section.
return(

<div className="bg-gray-100 min-h-screen py-10">

<div className="max-w-6xl mx-auto px-4">

<div className="flex justify-between items-center mb-10">

<h1 className="text-4xl font-bold text-gray-800">
Study Session Tracker
</h1>

<div className="flex bg-gray-200 rounded-lg p-1">

<button
onClick={()=>dashboardRef.current.scrollIntoView({behavior:"smooth"})}
className="px-4 py-2 bg-white rounded-md shadow transition"
>
Dashboard
</button>

<button
onClick={()=>analyticsRef.current.scrollIntoView({behavior:"smooth"})}
className="px-4 py-2 transition"
>
Analytics
</button>

</div>

</div>

<div ref={dashboardRef}>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
    
<div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg">

<h2 className="text-xl font-semibold mb-4">
{editingId ? "Edit Study Session" : "Add Study Session"}
</h2>

<form onSubmit={addSession} className="space-y-4">

<div>

<label className="text-sm font-medium text-black">
Subject
</label>

<select
value={subject}
onChange={e=>setSubject(e.target.value)}
className={`w-full border rounded-lg p-2 mt-1 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
    subject ? "text-black" : "text-gray-400"
}`}
>

<option value="">Select subject</option>

{subjects.map(sub=>(
<option key={sub} value={sub}>{sub}</option>
))}

<option value="Other">Other</option>

</select>

{subject==="Other" && (

<input
type="text"
placeholder="Enter subject"
value={customSubject}
onChange={e=>setCustomSubject(e.target.value)}
className="border rounded-lg p-2 mt-2 w-full"
/>

)}

</div>

<div className="grid grid-cols-2 gap-3">

<div>

<label className="text-sm font-medium text-black">
Duration (hours)
</label>

<input
type="number"
placeholder="Enter hours"
value={duration}
onChange={e=>setDuration(e.target.value)}
className="border rounded-lg p-2 mt-1 w-full"
/>

</div>

<div>

<label className="text-sm font-medium text-black">
Date
</label>

<input
type="date"
value={date}
onChange={e=>setDate(e.target.value)}
className="border rounded-lg p-2 mt-1 w-full"
/>

</div>

</div>

<div>

<p className="text-sm font-medium text-black">
Productivity
</p>

<div className="flex text-2xl">

{[1,2,3,4,5].map(star=>(
<span
key={star}
onClick={()=>setProductivity(star)}
className={`cursor-pointer ${
star<=productivity
?"text-blue-500"
:"text-gray-300"
}`}
>
★
</span>
))}

</div>

</div>

<div className="flex gap-3">

<button
type="submit"
className="flex-1 bg-black text-white py-2 rounded-lg transition active:scale-95 hover:bg-gray-900"
>
{editingId ? "Update Session" : "Add Session"}
</button>

{editingId && (

<button
type="button"
onClick={()=>{
setEditingId(null)
resetForm()
}}
className="px-4 py-2 border rounded-lg transition hover:bg-gray-100"
>
Cancel
</button>

)}

</div>

</form>

</div>

<div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg">

<h2 className="text-xl font-semibold mb-4">
Study Summary
</h2>

<div className="divide-y">

<div className="flex justify-between py-3">

<div className="flex gap-3 items-center">

<div className="bg-gray-100 p-2 rounded-full">
<BookOpen size={18}/>
</div>

<div>
<p className="text-black font-medium">
Total Study Time
</p>
<p className="text-xs text-gray-400">| Hours</p>
</div>

</div>

<div>
<span className="text-4xl font-bold">
{totalHours}
</span>
<span className="text-gray-500 ml-1">hrs</span>
</div>

</div>

<div className="flex justify-between py-4">

<div className="flex gap-3 items-center">

<div className="bg-gray-100 p-2 rounded-full">
<Calendar size={18}/>
</div>

<div>
<p className="text-black font-medium">
Total Sessions
</p>
<p className="text-xs text-gray-400">| Sessions</p>
</div>

</div>

<span className="text-3xl font-bold">
{totalSessions}
</span>

</div>

<div className="flex justify-between py-4">

<div className="flex gap-3 items-center">

<div className="bg-gray-100 p-2 rounded-full">
<TrendingUp size={18}/>
</div>

<div>
<p className="text-black font-medium">
Avg Productivity
</p>
<p className="text-blue-500 text-sm">
{renderStars(avgProductivity)}
</p>
</div>

</div>

<div>
<span className="text-3xl font-bold">
{avgProductivity}
</span>
<span className="text-gray-400 ml-1">★</span>
</div>

</div>

</div>

<div className="border-t mt-1 pt-4">

<p className="text-black font-medium mb-3">
Recent Sessions:
</p>

<select
value={summaryFilter}
onChange={(e)=>setSummaryFilter(e.target.value)}
className="w-full border rounded-lg p-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
>

<option>All</option>

{subjects.map(sub=>(
<option key={sub}>{sub}</option>
))}

</select>

</div>

</div>

</div>

<div className="bg-white rounded-2xl shadow p-6 mt-8 transition-all duration-200 hover:shadow-lg">

<div className="flex justify-between mb-4">

<h2 className="text-xl font-semibold flex items-center gap-2">
<Clock size={18}/>
Recent Sessions
</h2>

<div className="flex items-center gap-2 border rounded-lg px-3 py-1">

<ListFilter size={16}/>

<select
value={filterSubject}
onChange={(e)=>setFilterSubject(e.target.value)}
className="outline-none text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition rounded-md px-1"
>

<option>All</option>

{subjects.map(sub=>(
<option key={sub}>{sub}</option>
))}

</select>

</div>

</div>

<div className="border rounded-xl overflow-hidden">

<table className="w-full text-sm">

<thead className="hidden md:table-header-group bg-gray-100">

<tr>

<th className="text-left py-3 px-4">Subject</th>
<th className="text-left px-4">Duration</th>
<th className="text-left px-4">Date</th>
<th className="text-left px-4">Productivity</th>
<th className="text-right px-4">Actions</th>

</tr>

</thead>

<tbody>

{filteredSessions.map(session=>(

<tr key={session.id} className="border-t md:table-row flex flex-col md:flex-row p-3 md:p-0">

<td className="py-2 px-4 block md:table-cell flex justify-between items-start relative">

<span>{session.subject}</span>

<div className="md:hidden">

<button
onClick={(e)=>{
e.stopPropagation()
setOpenMenuId(openMenuId===session.id?null:session.id)
}}
className="text-xl"
>
⋯
</button>

{openMenuId===session.id &&(

<div className="absolute right-0 mt-6 bg-white border rounded-lg shadow-md z-10">

<button
onClick={()=>{
startEdit(session)
setOpenMenuId(null)
}}
className="block w-full text-left px-4 py-2 hover:bg-gray-100"
>
Edit
</button>

<button
onClick={()=>{
deleteSession(session.id)
setOpenMenuId(null)
}}
className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
>
Delete
</button>

</div>

)}

</div>

</td>

<td className="px-4 block md:table-cell">
<span className="md:hidden text-gray-500 text-sm">Duration: </span>
{session.duration} hrs
</td>

<td className="px-4 block md:table-cell">
<span className="md:hidden text-gray-500 text-sm">Date: </span>
{session.date}
</td>

<td className="px-4 text-blue-500 block md:table-cell">
<span className="md:hidden text-gray-500 text-sm">Productivity: </span>
{"★".repeat(session.productivity)}
</td>



<td className="px-4 text-right">

<div className="hidden md:flex md:space-x-2 justify-end">

<button
onClick={()=>startEdit(session)}
className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
>
Edit
</button>

<button
onClick={()=>deleteSession(session.id)}
className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
>
Delete
</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

{/* ANALYTICS */}

<div
ref={analyticsRef}
className="bg-white rounded-2xl shadow p-6 mt-8 transition-all duration-200 hover:shadow-lg"
>

<h2 className="text-xl font-semibold mb-1">
Analytics
</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

<div>

<h3 className="text-lg font-semibold mb-2">
Study Analytics
</h3>

<p className="text-gray-600">
Study sessions allow students to log and analyze their study behaviour patterns.
</p>

</div>

<div className="border rounded-xl p-4 h-72 w-full min-w-0">

<Bar
data={chartData}
options={chartOptions}
/>

</div>

</div>

</div>

</div>

</div>

</div>

)

}

export default App