const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: 'postgres', // Remplace par ton utilisateur PostgreSQL
    host: 'localhost',
    database: 'postgres',
    password: 'admin', // Remplace par ton mot de passe PostgreSQL
    port: 5432, // Port par défaut de PostgreSQL
});

app.use(cors());
app.use(bodyParser.json());

// Fonction pour insérer un enseignant
app.post('/add-enseignant', async (req, res) => {
    const { numens, nom, nbheures, tauxhoraire } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO Enseignant (numens, nom, nbheures, tauxhoraire) VALUES ($1, $2, $3, $4) RETURNING *',
            [numens, nom, nbheures, tauxhoraire]
        );

        res.status(200).json({ message: 'Enseignant ajouté avec succès', enseignant: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'enseignant', error });
    }
});

// Route pour récupérer tous les enseignants
app.get('/enseignants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Enseignant');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des enseignants', error });
    }
});

// Route pour modifier un enseignant
app.put('/update-enseignant/:numens', async (req, res) => {
    const { numens } = req.params;
    const { nom, nbheures, tauxhoraire } = req.body;
    try {
        const result = await pool.query(
            'UPDATE Enseignant SET nom = $1, nbheures = $2, tauxhoraire = $3 WHERE numens = $4 RETURNING *',
            [nom, nbheures, tauxhoraire, numens]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Enseignant non trouvé" });
        }
        res.status(200).json({ message: 'Enseignant mis à jour avec succès', enseignant: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'enseignant", error });
    }
});

// Route pour supprimer un enseignant
app.delete('/delete-enseignant/:numens', async (req, res) => {
    const { numens } = req.params;
    try {
        const result = await pool.query('DELETE FROM Enseignant WHERE numens = $1 RETURNING *', [numens]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Enseignant non trouvé" });
        }
        res.status(200).json({ message: 'Enseignant supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'enseignant", error });
    }
});
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});