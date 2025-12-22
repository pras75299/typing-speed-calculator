const { pool } = require('../config/database');

async function getRandomText(req, res, next) {
  try {
    // Character limit for typing tests (reasonable length for testing)
    // Easy: 100-200, Medium: 150-300, Hard: 200-400
    const maxChars = parseInt(req.query.maxChars) || 400; // Default max 400 characters
    const minChars = parseInt(req.query.minChars) || 100; // Default min 100 characters
    const language = req.query.language || 'javascript'; // Default to javascript

    // First, check if language column exists
    let hasLanguageColumn = false;
    try {
      const columnCheck = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'texts' AND column_name = 'language'`
      );
      hasLanguageColumn = columnCheck.rows.length > 0;
    } catch (err) {
      // If we can't check, assume it doesn't exist
      hasLanguageColumn = false;
    }

    let result;
    if (hasLanguageColumn) {
      // Query with language filter - only return code snippets (exclude old text entries)
      // Code snippets typically contain programming keywords or structure
      result = await pool.query(
        `SELECT id, content, difficulty_level, word_count, character_count, language 
         FROM texts 
         WHERE is_active = true 
           AND language = $1
           AND character_count >= $2 
           AND character_count <= $3
           AND (content LIKE '%function%' OR content LIKE '%def %' OR content LIKE '%class %' 
                OR content LIKE '%const %' OR content LIKE '%let %' OR content LIKE '%var %'
                OR content LIKE '%public %' OR content LIKE '%package %' OR content LIKE '%import %'
                OR content LIKE '%#include%' OR content LIKE '%#include<%')
         ORDER BY RANDOM() 
         LIMIT 1`,
        [language, minChars, maxChars]
      );

      if (result.rows.length === 0) {
        // Fallback: try without character limits if no text found
        result = await pool.query(
          `SELECT id, content, difficulty_level, word_count, character_count, language 
           FROM texts 
           WHERE is_active = true 
             AND language = $1 
             AND character_count <= $2
             AND (content LIKE '%function%' OR content LIKE '%def %' OR content LIKE '%class %' 
                  OR content LIKE '%const %' OR content LIKE '%let %' OR content LIKE '%var %'
                  OR content LIKE '%public %' OR content LIKE '%package %' OR content LIKE '%import %'
                  OR content LIKE '%#include%' OR content LIKE '%#include<%')
           ORDER BY RANDOM() 
           LIMIT 1`,
          [language, maxChars]
        );
      }
      
      // If still no results, try without code pattern filter (for edge cases)
      if (result.rows.length === 0) {
        result = await pool.query(
          `SELECT id, content, difficulty_level, word_count, character_count, language 
           FROM texts 
           WHERE is_active = true 
             AND language = $1 
             AND character_count <= $2 
           ORDER BY RANDOM() 
           LIMIT 1`,
          [language, maxChars]
        );
      }
    } else {
      // Fallback: query without language column (for backward compatibility)
      result = await pool.query(
        `SELECT id, content, difficulty_level, word_count, character_count 
         FROM texts 
         WHERE is_active = true 
           AND character_count >= $1 
           AND character_count <= $2 
         ORDER BY RANDOM() 
         LIMIT 1`,
        [minChars, maxChars]
      );

      if (result.rows.length === 0) {
        // Fallback: try without character limits
        result = await pool.query(
          `SELECT id, content, difficulty_level, word_count, character_count 
           FROM texts 
           WHERE is_active = true 
             AND character_count <= $1 
           ORDER BY RANDOM() 
           LIMIT 1`,
          [maxChars]
        );
      }

      // Add default language for backward compatibility
      if (result.rows.length > 0) {
        result.rows[0].language = 'javascript';
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: `No code snippets available${hasLanguageColumn ? ` for language '${language}'` : ''} within the specified character limit` 
      });
    }

    res.json({ text: result.rows[0] });
  } catch (error) {
    console.error('Error in getRandomText:', error);
    next(error);
  }
}

async function getTextById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Check if language column exists
    let hasLanguageColumn = false;
    try {
      const columnCheck = await pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'texts' AND column_name = 'language'`
      );
      hasLanguageColumn = columnCheck.rows.length > 0;
    } catch (err) {
      hasLanguageColumn = false;
    }

    let query;
    if (hasLanguageColumn) {
      query = 'SELECT id, content, difficulty_level, word_count, character_count, language FROM texts WHERE id = $1 AND is_active = true';
    } else {
      query = 'SELECT id, content, difficulty_level, word_count, character_count FROM texts WHERE id = $1 AND is_active = true';
    }

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Code snippet not found' });
    }

    // Add default language if column doesn't exist
    if (!hasLanguageColumn && result.rows[0]) {
      result.rows[0].language = 'javascript';
    }

    res.json({ text: result.rows[0] });
  } catch (error) {
    console.error('Error in getTextById:', error);
    next(error);
  }
}

module.exports = {
  getRandomText,
  getTextById,
};

