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
// @desc    Get all notes with search, filter, pagination, and sorting
// @route-search   GET /api/notes?search=keyword
// @route-filter   GET /api/notes?fromDate=2024-04-11&toDate=2024-04-11
// @route-search&filter   GET /api/notes?search=keyword&fromDate=2024-01-01
// @route-pagination GET /api/notes/page=1&limit=3
// @route-search&pagination     GET /api/notes?search=keyword&page=1&limit=2
// @route-sortbytitle  GET /api/notes?sortBy=title&order=asc
// @route-combineverything  GET /api/notes?search=note&fromDate=2025-04-01&toDate=2025-04-12&page=1&limit=2&sortBy=title&order=desc
exports.getNotes = async (req, res) => {
    try {
      const { search, fromDate, toDate, page = 1, limit = 5, sortBy = 'createdAt', order = 'desc' } = req.query;
  
      const query = { user: req.user.id };
  
      // Search by title or content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }
  
      // Filter by date range
      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
      }
  
      // Calculate skip and limit for pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Sorting logic
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder;
  
      const notes = await Note.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));
  
      const total = await Note.countDocuments(query);
      const totalPages = Math.ceil(total / limit);
  
      res.status(200).json({
        total,
        page: parseInt(page),
        totalPages,
        notes,
      });
    } catch (err) {
      console.error(err);
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




