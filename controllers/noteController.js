const Note = require("../models/Note");
const { createNoteSchema, updateNoteSchema } = require("../validations/noteValidation");


// @desc    Create a new note
// @route   POST /api/notes
exports.createNote = async (req, res) => {
    try {
        const { error } = createNoteSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const note = await Note.create({
            title: req.body.title,
            content: req.body.content,
            user: req.user.id, // Assuming auth middleware attaches user
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
    try {
        const { error } = updateNoteSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                content: req.body.content,
            },
            { new: true }
        );
        res.status(200).json(note);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Toggle favorite
// @route   PUT /api/notes/:id/favorite
exports.toggleFavorite = async (req, res) => {
    try {
      const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
  
      if (!note) return res.status(404).json({ message: "Note not found" });
  
      note.isFavorite = !note.isFavorite;
      await note.save();
  
      res.status(200).json({ message: `Note ${note.isFavorite ? "marked as" : "removed from"} favorites`, note });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // @desc    Get all favorite notes
  // @route   GET /api/notes/favorites
  exports.getFavorites = async (req, res) => {
    try {
      const favorites = await Note.find({ user: req.user.id, isFavorite: true });
      res.status(200).json(favorites);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
