// Generic CRUD Controller Factory
export const createCRUDController = (Model) => {
  return {
    // GET all documents
    getAll: async (req, res) => {
      try {
        const documents = await Model.find().populate([]);
        res.json(documents);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // GET single document by ID
    getById: async (req, res) => {
      try {
        const document = await Model.findById(req.params.id);
        if (!document) return res.status(404).json({ error: 'Not found' });
        res.json(document);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // CREATE new document
    create: async (req, res) => {
      try {
        // Log request body for debugging
        console.log('Create request body:', req.body);
        
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ 
            error: 'Request body is empty. Please provide data.',
            receivedBody: req.body 
          });
        }

        const document = new Model(req.body);
        const saved = await document.save();
        res.status(201).json(saved);
      } catch (error) {
        console.error('Create error:', error);
        res.status(400).json({ 
          error: error.message,
          details: error.errors // Include validation details
        });
      }
    },

    // UPDATE document
    update: async (req, res) => {
      try {
        const document = await Model.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
        if (!document) return res.status(404).json({ error: 'Not found' });
        res.json(document);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    // DELETE document
    delete: async (req, res) => {
      try {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully', data: document });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  };
};
