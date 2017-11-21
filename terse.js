/**
 * Terse
 * Simple SQLite URL shortener
 *
 * Ashen Gunaratne
 * mail@ashenm.ml
 *
 */

const sqlite = require('sqlite3');

class Terse {

  constructor(database) {
    Terse.initialise(this, database);
  }

  /**
   * Returns database record
   * embodying expanded URL
   */
  get(shortURL, callback) {
    this.db.get(`SELECT url FROM terse WHERE id = ?`, Terse.decode(shortURL), function(error, row) {
      error
        ? callback(error)
        : callback(null, row);
    });
  }

  /**
   * Returns shorted URL and populates
   * a corresponding database record
   */
  put(longURL, callback) {
    this.db.run(`INSERT INTO terse (url) VALUES (?)`, longURL, function(error) {
      error
        ? callback(error)
        : callback(null, Terse.encode(this.lastID));
    });
  }

  /**
   * Closes the database and executes
   * `callback` readdressing error object
   */
  terminate(callback) {
    this.db.close(callback);
  }

  /**
   * Returns a Boolean indicating
   * database connection status
   */
  get state() {
    return this.db.open;
  }

  /**
   * Initialise SQLite database
   */
  static initialise(terse, database) {
    terse.db = new sqlite.Database(database, function(error) {

      if (error)
        throw new Error(`${database} initiation failed!`);

      // serialising execution to allow automated internal
      // table creation prior overriding their defaults
      this.serialize(function() {

        // initialise table
        this.run(`CREATE TABLE IF NOT EXISTS terse (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL)`);

        // override starting `id` to 3853
        // reserving two letter shortened URLs
        this.run(`INSERT INTO sqlite_sequence (name, seq) SELECT 'terse', 3853 WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name='terse')`);

      });

    });
  }

  /**
   * Returns record id of a given shortened URL
   */
  static decode(url) {
    let id = 0;
    for (let i = 0; i < url.length; i++)
      id = id * Terse.MAP.length + Terse.MAP.indexOf(url[i]);
    return id;
  }

  /**
   * Return character encode of an given record id
   */
  static encode(id) {
    const eURL = new Array();
    while (id) {
      eURL.push(Terse.MAP[id % Terse.MAP.length]);
      id = Math.floor(id / Terse.MAP.length);
    }
    return eURL.reverse().join('');
  }

  /**
   * Return character map
   * being used for URL shortening
   */
  static get MAP() {
    return '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  };

};

module.exports = Terse;
