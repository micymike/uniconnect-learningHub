import React, { useState } from "react";

// Note: Integrate this component into your notes area to enable advanced organization and search/filter features.

export type NoteFilter = {
  search: string;
  folder: string;
  tags: string[];
  colorLabel: string;
  fileType: string;
  dateFrom: string;
  dateTo: string;
  icon: string;
};

const colorOptions = [
  { label: "Red", value: "red", color: "#f87171" },
  { label: "Orange", value: "orange", color: "#fb923c" },
  { label: "Yellow", value: "yellow", color: "#facc15" },
  { label: "Green", value: "green", color: "#4ade80" },
  { label: "Blue", value: "blue", color: "#60a5fa" },
  { label: "Purple", value: "purple", color: "#a78bfa" },
  { label: "Gray", value: "gray", color: "#9ca3af" },
];

const iconOptions = [
  { label: "Book", value: "📚" },
  { label: "Exam", value: "📝" },
  { label: "Lecture", value: "🎤" },
  { label: "Lab", value: "🧪" },
  { label: "Default", value: "📎" },
];

export default function NoteOrganizer({
  onFilterChange,
  onCreateFolder,
  availableFolders,
  availableTags,
}: {
  onFilterChange: (filter: NoteFilter) => void;
  onCreateFolder: (folder: string) => void;
  availableFolders: string[];
  availableTags: string[];
}) {
  const [filter, setFilter] = useState<NoteFilter>({
    search: "",
    folder: "",
    tags: [],
    colorLabel: "",
    fileType: "",
    dateFrom: "",
    dateTo: "",
    icon: "",
  });
  const [newFolder, setNewFolder] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const handleFilterChange = (key: keyof NoteFilter, value: any) => {
    const updated = { ...filter, [key]: value };
    setFilter(updated);
    onFilterChange(updated);
  };

  const handleAddTag = () => {
    if (tagInput && !filter.tags.includes(tagInput)) {
      const updatedTags = [...filter.tags, tagInput];
      setTagInput("");
      handleFilterChange("tags", updatedTags);
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleFilterChange(
      "tags",
      filter.tags.filter((t) => t !== tag)
    );
  };

  const handleCreateFolder = () => {
    if (newFolder.trim()) {
      onCreateFolder(newFolder.trim());
      setNewFolder("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search notes (text, OCR, etc.)"
          className="border rounded px-3 py-2 w-48"
          value={filter.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={filter.folder}
          onChange={(e) => handleFilterChange("folder", e.target.value)}
        >
          <option value="">All Folders</option>
          {availableFolders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New folder"
          className="border rounded px-3 py-2 w-32"
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
        />
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-2 rounded"
          onClick={handleCreateFolder}
        >
          + Create Folder
        </button>
        <input
          type="text"
          placeholder="Add tag"
          className="border rounded px-3 py-2 w-32"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
        />
        <button
          className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-2 rounded"
          onClick={handleAddTag}
        >
          + Tag
        </button>
        <div className="flex gap-1">
          {filter.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 rounded px-2 py-1 text-xs flex items-center"
            >
              {tag}
              <button
                className="ml-1 text-red-500"
                onClick={() => handleRemoveTag(tag)}
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <select
          className="border rounded px-3 py-2"
          value={selectedColor}
          onChange={(e) => {
            setSelectedColor(e.target.value);
            handleFilterChange("colorLabel", e.target.value);
          }}
        >
          <option value="">Color Label</option>
          {colorOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={selectedIcon}
          onChange={(e) => {
            setSelectedIcon(e.target.value);
            handleFilterChange("icon", e.target.value);
          }}
        >
          <option value="">Icon</option>
          {iconOptions.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label} {i.value}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={filter.fileType}
          onChange={(e) => handleFilterChange("fileType", e.target.value)}
        >
          <option value="">File Type</option>
          <option value="pdf">PDF</option>
          <option value="doc">DOC</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
          <option value="md">MD</option>
          <option value="image">Image</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={filter.dateFrom}
          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={filter.dateTo}
          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
        />
      </div>
    </div>
  );
}
