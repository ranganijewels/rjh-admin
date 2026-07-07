"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  UnderlineIcon,
  WholeWordIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/cards/card";

export default function RichTextEditor({
  value = "",
  onChange = () => {},
  placeholder,
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedRangeRef = useRef(null);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current) return;
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const restoreSavedSelection = () => {
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    if (savedRangeRef.current) {
      try {
        sel.addRange(savedRangeRef.current);
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  };

  const runCommand = (command, value = null) => {
    if (!editorRef.current) return;
    restoreSavedSelection();
    editorRef.current.focus();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node =
        sel.anchorNode?.nodeType === 3
          ? sel.anchorNode.parentNode
          : sel.anchorNode;
      const mediaContainer = node.closest(".media-container");

      if (mediaContainer) {
        if (command === "justifyLeft") {
          mediaContainer.style.display = "block";
          mediaContainer.style.margin = "8px 0";
          mediaContainer.style.textAlign = "left";
          mediaContainer.style.marginRight = "auto";
        } else if (command === "justifyCenter") {
          mediaContainer.style.display = "block";
          mediaContainer.style.margin = "8px auto";
          mediaContainer.style.textAlign = "center";
        } else if (command === "justifyRight") {
          mediaContainer.style.display = "block";
          mediaContainer.style.margin = "8px 0";
          mediaContainer.style.marginLeft = "auto";
          mediaContainer.style.textAlign = "right";
        } else if (command === "justifyFull") {
          mediaContainer.style.display = "block";
          mediaContainer.style.margin = "8px 0";
          mediaContainer.style.width = "100%";
        }
        handleInput();
        return;
      }
    }

    document.execCommand(command, false, value);
    handleInput();
  };

  const applyFontSize = (val) => {
    const px = parseInt(val, 10);
    if (isNaN(px)) return;
    restoreSavedSelection();
    if (editorRef.current) editorRef.current.focus();

    document.execCommand("fontSize", false, "7");

    const fonts = editorRef.current.querySelectorAll('font[size="7"]');
    fonts.forEach((el) => {
      el.removeAttribute("size");
      el.style.fontSize = `${px}px`;
    });

    handleInput();
  };

  const applyHeading = (val) => {
    if (!val) return;
    restoreSavedSelection();
    if (editorRef.current) editorRef.current.focus();

    document.execCommand("formatBlock", false, val);
    handleInput();
  };

  const applyOrderedList = (style) => {
    runCommand("insertOrderedList");

    setTimeout(() => {
      const lists = editorRef.current?.querySelectorAll("ol") || [];
      if (!lists.length) return;

      const lastList = lists[lists.length - 1];

      lastList.querySelectorAll("li").forEach((li) => {
        li.style.listStyleType = style;
      });

      handleInput();
    }, 50);
  };

  const applyUnorderedList = (style) => {
    runCommand("insertUnorderedList");

    setTimeout(() => {
      const lists = editorRef.current?.querySelectorAll("ul") || [];
      if (!lists.length) return;

      const lastList = lists[lists.length - 1];

      lastList.querySelectorAll("li").forEach((li) => {
        li.style.listStyleType = style;
      });

      handleInput();
    }, 50);
  };

  const insertLink = () => {
    const url = prompt("Enter the link URL:");
    if (!url) return;
    runCommand("createLink", url);
  };

  const insertImageURL = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    runCommand("insertImage", url);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleDelete = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const mediaContainer = btn.closest(".media-container");
    if (mediaContainer) {
      mediaContainer.remove();
      handleInput();
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const base64 = await fileToBase64(file);

      if (!editorRef.current) continue;
      editorRef.current.focus();
      restoreSavedSelection();

      const mediaContainer = document.createElement("div");
      mediaContainer.className = "media-container";
      mediaContainer.style.display = "inline-block";
      mediaContainer.style.position = "relative";
      mediaContainer.style.maxWidth = "100%";
      mediaContainer.style.resize = "both";
      mediaContainer.style.overflow = "hidden";
      mediaContainer.style.borderRadius = "8px";
      mediaContainer.style.margin = "8px 0";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "media-delete-btn";
      deleteButton.style.position = "absolute";
      deleteButton.style.top = "6px";
      deleteButton.style.right = "6px";
      deleteButton.style.background = "rgba(0,0,0,0.6)";
      deleteButton.style.color = "#fff";
      deleteButton.style.border = "none";
      deleteButton.style.borderRadius = "999px";
      deleteButton.style.padding = "6px";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.zIndex = "20";
      deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`;
      deleteButton.addEventListener("click", handleDelete);

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = base64;
        img.style.display = "block";
        img.style.width = "auto";
        img.style.height = "auto";
        img.style.borderRadius = "8px";
        img.style.objectFit = "contain";

        img.style.resize = "both";
        img.style.overflow = "hidden";

        mediaContainer.appendChild(img);
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = base64;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.style.display = "block";
        video.style.width = "auto";
        video.style.height = "auto";
        video.style.borderRadius = "8px";

        video.style.resize = "both";
        video.style.overflow = "hidden";

        mediaContainer.appendChild(video);
      } else {
        continue;
      }

      mediaContainer.appendChild(deleteButton);

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(mediaContainer);
        const afterRange = document.createRange();
        afterRange.setStartAfter(mediaContainer);
        afterRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(afterRange);
      } else {
        editorRef.current.appendChild(mediaContainer);
      }

      handleInput();
    }
    e.target.value = "";
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const clearAll = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = "";
    handleInput();
  };

  const wordFontSizes = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72,
  ];

  return (
    <Card className="w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={(val) => applyFontSize(val)}>
            <SelectTrigger className="w-[115px] px-2 py-1 border rounded">
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {wordFontSizes.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => applyHeading(val)}>
            <SelectTrigger className="w-[115px] px-2 py-1 border rounded">
              <SelectValue placeholder="Heading" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="<h1>">H1</SelectItem>
                <SelectItem value="<h2>">H2</SelectItem>
                <SelectItem value="<h3>">H3</SelectItem>
                <SelectItem value="<h4>">H4</SelectItem>
                <SelectItem value="<h5>">H5</SelectItem>
                <SelectItem value="<p>">Paragraph</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => applyOrderedList(val)}>
            <SelectTrigger className="w-[115px] px-2 py-1 border rounded">
              <SelectValue placeholder="Ordered List" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="decimal">1,2,3</SelectItem>
                <SelectItem value="lower-alpha">a,b,c</SelectItem>
                <SelectItem value="upper-alpha">A,B,C</SelectItem>
                <SelectItem value="lower-roman">i,ii,iii</SelectItem>
                <SelectItem value="upper-roman">I,II,III</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => applyUnorderedList(val)}>
            <SelectTrigger className="w-[115px] px-2 py-1 border rounded">
              <SelectValue placeholder="Unordered List" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="disc">Disc</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("bold")}
            title="Bold"
          >
            <BoldIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("italic")}
            title="Italic"
          >
            <ItalicIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("underline")}
            title="Underline"
          >
            <UnderlineIcon className="text-lg" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("justifyLeft")}
            title="Align Left"
          >
            <AlignLeftIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("justifyCenter")}
            title="Align Center"
          >
            <AlignCenterIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("justifyRight")}
            title="Align Right"
          >
            <AlignRightIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => runCommand("justifyFull")}
            title="Justify"
          >
            <AlignJustifyIcon className="text-lg" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={insertLink}
            variant="outline"
            title="Insert Link"
          >
            <Link2Icon className="text-lg" />
          </Button>

          <Button
            type="button"
            onClick={insertImageURL}
            variant="outline"
            title="Insert Image URL"
          >
            <WholeWordIcon className="text-lg" />
          </Button>

          <Button
            type="button"
            onClick={handleFileClick}
            variant="outline"
            title="Upload Image/Video"
          >
            <ImageIcon className="text-lg" />
          </Button>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end flex-grow">
          <Button
            type="button"
            size="sm"
            onClick={clearAll}
            variant="primary"
            title="Clear All"
          >
            <Trash2Icon className="text-lg" />
            Clear All
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="min-h-[250px] pl-5 rounded-b-lg p-4"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ outline: "none" }}
      />
    </Card>
  );
}
