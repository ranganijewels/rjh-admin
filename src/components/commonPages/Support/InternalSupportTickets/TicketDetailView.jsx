// "use client";

// import React, { useState } from "react";
// import { Card, CardContent } from "@/components/common/ui/cards/card";
// import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
// import { Button } from "@/components/common/ui/button";
// import { Badge } from "@/components/common/ui/badge";
// import { Dialog, DialogTrigger } from "@/components/common/ui/dialog";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/common/ui/select";
// import { Textarea } from "@/components/common/ui/textarea";
// import { Paperclip, Mail, Loader, UserPlus, X } from "lucide-react";
// import MessageCard from "./MessageCard";

// const TicketDetailsView = ({
//   selectedTicket,
//   setIsAssignDialogOpen,
//   isAssignDialogOpen,
//   isAssigning,
//   assignTicket,
//   unassignTicket,
//   filteredAssignees,
//   assigneeSearchQuery,
//   setAssigneeSearchQuery,
//   updateTicketStatus,
//   getStatusColor,
//   getPriorityColor,
//   getAssigneeStatusColor,
//   // newReply,
//   // setNewReply,
//   replyFiles,
//   handleFileSelect,
//   removeFile,
//   replyFileInputRef,
//   addReply,
//   isReplying,
// }) => {
//   if (!selectedTicket) {
//     return (
//       <div className="w-1/2 flex items-center justify-center text-muted-foreground">
//         <p>No ticket selected</p>
//       </div>
//     );
//   }

//   //   const [selectedTicket, setSelectedTicket] = useState(SUPPORT_MESSAGES[0]);
//   const getFileIcon = (type) => {
//     if (!type || typeof type !== "string") return File;

//     if (type.startsWith("image/")) return Image;
//     if (type.startsWith("video/")) return Video;
//     if (type.includes("pdf") || type.includes("document")) return FileText;
//     return File;
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const isImageFile = (type) =>
//     typeof type === "string" && type.startsWith("image/");

//   const [newReply, setNewReply] = useState("");

//   return (
//     <div className="w-1/2 flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
//         <div className="flex items-start justify-between mb-3">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <h2 className="text-lg font-semibold text-primary">
//                 {selectedTicket.subject}
//               </h2>
//               <Badge
//                 variant={getStatusColor(selectedTicket.status)}
//                 className={
//                   selectedTicket.status === "open"
//                     ? "bg-primary text-white"
//                     : ""
//                 }
//               >
//                 {selectedTicket.status}
//               </Badge>
//             </div>
//             <div className="text-sm text-muted-foreground">
//               {selectedTicket.id} • {selectedTicket.store} •{" "}
//               {selectedTicket.department}
//             </div>
//           </div>
//           <Select
//             value={selectedTicket.status}
//             onValueChange={(value) =>
//               updateTicketStatus(selectedTicket.id, value)
//             }
//           >
//             <SelectTrigger className="w-32">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="open">Open</SelectItem>
//               <SelectItem value="in-progress">In Progress</SelectItem>
//               <SelectItem value="resolved">Resolved</SelectItem>
//               <SelectItem value="closed">Closed</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
//           <div className="flex items-center gap-1">
//             <Avatar className="h-6 w-6">
//               <AvatarFallback>
//                 {selectedTicket.createdBy.name[0]}
//               </AvatarFallback>
//             </Avatar>
//             Created by {selectedTicket.createdBy.name}
//           </div>
//           <div className="flex items-center gap-1">
//             <div
//               className={`w-2 h-2 rounded-full ${getPriorityColor(
//                 selectedTicket.priority
//               )}`}
//             />
//             {selectedTicket.priority} priority
//           </div>
//         </div>

//         {/* Assignment Card */}
//         <Card className="mb-4 border border-primary">
//           <CardContent className="p-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <UserPlus className="h-4 w-4 text-brand" />
//                 <span className="text-sm font-mono">Assignment</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 {selectedTicket.assignedTo ? (
//                   <>
//                     <Avatar className="h-6 w-6">
//                       <AvatarFallback>
//                         {selectedTicket.assignedTo.name[0]}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <div className="font-mono text-sm">
//                         {selectedTicket.assignedTo.name}
//                       </div>
//                       <div className="text-xs text-muted-foreground">
//                         {selectedTicket.assignedTo.role}
//                       </div>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setIsAssignDialogOpen(true)}
//                       disabled={isAssigning}
//                       className="border border-primary text-primary"
//                     >
//                       {isAssigning ? (
//                         <Loader className="h-3 w-3 animate-spin" />
//                       ) : (
//                         "Reassign"
//                       )}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={unassignTicket}
//                       disabled={isAssigning}
//                     >
//                       {isAssigning ? (
//                         <Loader className="h-3 w-3 animate-spin" />
//                       ) : (
//                         "Unassign"
//                       )}
//                     </Button>
//                   </>
//                 ) : (
//                   <Dialog
//                     open={isAssignDialogOpen}
//                     onOpenChange={setIsAssignDialogOpen}
//                   >
//                     <DialogTrigger asChild>
//                       <Button
//                         size="sm"
//                         className="gradient-brand text-white shadow-brand"
//                       >
//                         <UserPlus className="h-4 w-4 mr-2" /> Assign
//                       </Button>
//                     </DialogTrigger>
//                   </Dialog>
//                 )}
//               </div>
//             </div>
//             {selectedTicket.ccUsers?.length > 0 && (
//               <div className="space-y-1">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Mail className="h-4 w-4 text-brand" />
//                   <span className="text-sm font-mono">CC Recipients</span>
//                 </div>
//                 {selectedTicket.ccUsers.map((cc) => (
//                   <div key={cc.id} className="flex items-center gap-2 text-sm">
//                     <Avatar className="h-5 w-5">
//                       <AvatarFallback>{cc.name[0]}</AvatarFallback>
//                     </Avatar>
//                     <span>{cc.name}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Messages & Replies */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         <div>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               {(selectedTicket.messages || []).map((msg) => (
//                 <MessageCard
//                   key={msg.id}
//                   name={msg.name}
//                   role={msg.role}
//                   timestamp={msg.timestamp}
//                   message={msg.message}
//                   description={msg.description}
//                   ccUsers={selectedTicket.ccUsers || []}
//                   attachments={msg.attachments || []}
//                 />
//               ))}
//             </div>
//           </CardContent>
//         </div>
//       </div>

//       {/* Reply Box */}
//       <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
//         <div className="space-y-3">
//           <Textarea
//             placeholder="Type your reply..."
//             value={newReply}
//             onChange={(e) => setNewReply(e.target.value)}
//             rows={3}
//             className=""
//             disabled={isReplying}
//           />

//           {/* Reply Attachments */}
//           {replyFiles.length > 0 && (
//             <div className="space-y-2">
//               <span className="text-xs font-medium text-muted-foreground">
//                 Attachments:
//               </span>
//               <div className="space-y-2">
//                 {replyFiles.map((file, index) => {
//                   const IconComponent = getFileIcon(file.type);
//                   return (
//                     <div
//                       key={index}
//                       className="flex items-center gap-3 p-2 border border-border rounded-lg bg-muted/30"
//                     >
//                       <IconComponent className="h-4 w-4 text-brand" />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium truncate">
//                           {file.name}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           {formatFileSize(file.size)}
//                         </p>
//                       </div>
//                       {isImageFile(file.type) && (
//                         <div className="w-8 h-8 rounded overflow-hidden">
//                           <img
//                             src={URL.createObjectURL(file)}
//                             alt="Preview"
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       )}
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeFile(index)}
//                         className="h-6 w-6 p-0 text-destructive hover:text-destructive"
//                         disabled={isReplying}
//                       >
//                         <X className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           <div className="flex items-center justify-between">
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => replyFileInputRef.current?.click()}
//                 className="border border-primary text-primary"
//                 disabled={isReplying}
//               >
//                 <Paperclip className="h-4 w-4 mr-2" />
//                 Attach File
//               </Button>
//               <input
//                 ref={replyFileInputRef}
//                 type="file"
//                 multiple
//                 className="hidden"
//                 accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
//                 onChange={handleFileSelect}
//                 disabled={isReplying}
//               />
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" disabled={isReplying}>
//                 Add Internal Note
//               </Button>
//               <Button
//                 onClick={addReply}
//                 size="sm"
//                 className="gradient-brand text-white shadow-brand"
//                 disabled={!newReply.trim() || isReplying}
//               >
//                 {isReplying ? (
//                   <>
//                     <Loader className="h-4 w-4 mr-2 animate-spin" />
//                     Sending...
//                   </>
//                 ) : (
//                   "Send Reply"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketDetailsView;

"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Badge } from "@/components/common/ui/badge";
import { Textarea } from "@/components/common/ui/textarea";
import { Button } from "@/components/common/ui/button";
import { Paperclip, Loader, X, UserPlus, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/common/ui/dialog";

export default function TicketDetailView({ selectedTicket }) {
  console.log("selectedTicket", selectedTicket);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState([]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500 dark:bg-muted-foreground";
    }
  };

  if (!selectedTicket)
    return (
      <div className="w-1/2 flex items-center justify-center text-muted-foreground">
        Select a ticket to view details
      </div>
    );

  if (selectedTicket.loading)
    return (
      <div className="w-1/2 flex items-center justify-center text-muted-foreground">
        <Loader className="h-5 w-5 animate-spin mr-2" /> Loading ticket
        details...
      </div>
    );

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    console.log("Reply sent:", reply, files);
    setReply("");
    setFiles([]);
  };

  return (
    <div className="w-1/2 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-primary">
                {selectedTicket.subject}
              </h2>
              <Badge
                variant={selectedTicket.status}
                className={
                  selectedTicket.status === "open"
                    ? "bg-primary text-white"
                    : ""
                }
              >
                {selectedTicket.status}{" "}
              </Badge>
            </div>
            {/* <p className="text-sm text-muted-foreground mt-1">
          Department: {selectedTicket.department?.name}
        </p> */}
            <div className="text-sm text-muted-foreground">
              {selectedTicket.ticket_number} • {selectedTicket?.description} •{" "}
              {selectedTicket.department?.name}
            </div>
          </div>
          <Select
            value={selectedTicket.status}
            // onValueChange={(value) =>
            //   updateTicketStatus(selectedTicket.id, value)
            // }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 mt-3 ml-3">
        <div className="flex items-center gap-1">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {selectedTicket?.creator?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          Created by {selectedTicket?.creator?.name}
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${getPriorityColor(
              selectedTicket.priority
            )}`}
          />
          {selectedTicket.priority?.charAt(0).toUpperCase() +
            selectedTicket.priority?.slice(1)}{" "}
          Priority
        </div>
      </div>
      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* <Card>
          <CardContent className="space-y-2 text-sm">
            <p>{selectedTicket.description}</p>
          </CardContent>
        </Card> */}
        <Card className="mb-4 border border-primary">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-brand" />
                <span className="text-sm font-mono">Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.assignedTo ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {selectedTicket.assignedTo.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-mono text-sm">
                        {selectedTicket.assignedTo.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedTicket.assignedTo.role}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => setIsAssignDialogOpen(true)}
                      disabled={isAssigning}
                      className="border border-primary text-primary"
                    >
                      {isAssigning ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        "Reassign"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={unassignTicket}
                      disabled={isAssigning}
                    >
                      {isAssigning ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : (
                        "Unassign"
                      )}
                    </Button>
                  </>
                ) : (
                  <Dialog
                  // open={isAssignDialogOpen}
                  // onOpenChange={setIsAssignDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gradient-brand text-white shadow-brand"
                      >
                        <UserPlus className="h-4 w-4 mr-2" /> Assign
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            </div>
            {/* {selectedTicket.ccUsers?.length > 0 && ( */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-brand" />
                <span className="text-sm font-mono">CC Recipients</span>
              </div>
              {/* {selectedTicket.cc.map((cc) => (
                  <div key={cc.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback>{cc.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{cc.name}</span>
                  </div>
                ))} */}
            </div>
            {/* )} */}
          </CardContent>
        </Card>
      </div>

      {/* Reply box */}
      <div className="p-4 border-t border-border bg-card/50">
        <Textarea
          placeholder="Type your reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
        />
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between border rounded px-2 py-1 text-sm"
              >
                <span>{f.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFile(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-3">
          <Button
            variant="outline"
            onClick={() => document.getElementById("replyFileInput").click()}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attach
          </Button>
          <input
            id="replyFileInput"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button onClick={handleSendReply}>Send Reply</Button>
        </div>
      </div>
    </div>
  );
}
