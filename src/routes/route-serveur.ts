// src/routes/route-serveur.ts

import { Router } from "express";
import { ControllerServeur } from "../controllers/controller-serveur";
import { MiddlewareAuth } from "../middlewares/middleware-auth";
import { Routes } from "./Routes";

/**
 * Represents an instance of a router, typically used to define and handle
 * application routes in a structured manner. The router instance can be used
 * to register middleware, define route-specific logic, and map HTTP methods to
 * corresponding handlers.
 *
 * This variable provides access to a modular routing system, allowing you to
 * group and manage routes efficiently within an application. It is commonly
 * employed in server frameworks to manage incoming requests and their
 * respective responses.
 */

const router = Router();
const controller = new ControllerServeur();
const middlewareAuth = new MiddlewareAuth();

const RoutesList: Routes[] = [
    {
        alias: "otr-serveurs", route: "/", method: "GET", parameters: "", description: "Affichage de tous les serveurs", comment: "GET /api/serveurs"
    },
    {
        alias: "otr-serveurs-infos", route: "/infos/:id", method: "GET", parameters: "id", description: "Affichage d'un serveur par son ID", comment: "GET /api/serveurs/infos/:id"
    },
    {
        alias: "otr-serveurs-primaire-secondaire", route: "/primaire-secondaire", method: "GET", parameters: "", description: "Affichage des serveurs primaire et secondaire", comment: "GET /api/serveurs/primaire-secondaire"
    },
    {
        alias: "otr-serveurs-creer", route: "/", method: "POST", parameters: "nom jeu version modpack modpack_url nom_monde embed_color path_serv start_script actif global",description: "Création d'un serveur", comment: "POST /api/serveurs Nécessite un token d'authentification"
    },
    {
        alias: "otr-serveurs-supprimer", route: "/", method: "DELETE", parameters: "id", description: "Suppression d'un serveur", comment: "DELETE /api/serveurs Nécessite un token d'authentification"
    },
    {
        alias: "otr-serveurs-start", route: "/start/", method: "POST", parameters: "id", description: "Lancement du serveur", comment: "POST /api/serveurs/start/ Nécessite un token d'authentification"
    },
    {
        alias: "otr-serveurs-stop", route: "/stop/", method: "POST", parameters: "id", description: "Arrêt du serveur", comment: "POST /api/serveurs/stop/ Nécessite un token d'authentification"
    },
    {
        alias: "otr-serveurs-installation", route: "/installation/", method: "POST", parameters: "discord_id nom_serveur version modpack_name embed_color serveur_loader modpack_url serveur_pack_url", description: "Installation du serveur", comment: "POST /api/serveurs/installation/ Nécessite un token d'authentification"
    },
];

// Enregistrement des routes
Routes.registerRoutes(RoutesList, "serveurs");

// GET /api/serveurs (affichage de tous les serveurs)
router.get("/", (req, res) => controller.getServeurs(req, res));

// GET /api/serveurs/infos/:id (affichage d'un serveur par son ID)
router.get("/infos/:id", (req, res) => controller.getById(req, res));

// GET /api/serveurs/primaire-secondaire (affichage des serveurs primaire et secondaire)
router.get("/primaire-secondaire", (req, res) => controller.getServeursPrimaireSecondaire(req, res));

// POST /api/serveurs (création d'un serveur) (token d'authentification requis)
router.post("/", middlewareAuth.handle.bind(middlewareAuth), async (req, res) => {
    try {
        const serveur = await controller.create(req, res);
        res.status(201).json({
            success: true,
            data: serveur,
        });
    } catch (err) {
        console.error("Erreur lors de la création :", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// DELETE /api/serveurs (suppression d'un serveur) (token d'authentification requis)
router.delete("/", middlewareAuth.handle.bind(middlewareAuth), async (req, res) => {
    try {
        const serveur = await controller.delete(req, res);
        res.status(200).json({
            success: true,
            data: serveur,
        });
    } catch (err) {
        console.error("Erreur lors de la suppression :", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// ---------------- MÉTHODES GESTION DU LANCEMENT / ARRET DU SERVEUR ------------------

// POST /api/serveurs/start/
router.post("/start/", middlewareAuth.handle.bind(middlewareAuth), async (req, res) => {
    try {
        await controller.start(req, res);
    } catch (err) {
        console.error("Erreur lors du lancement du serveur :", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /api/serveurs/stop/
router.post("/stop/", middlewareAuth.handle.bind(middlewareAuth), async (req, res) => {
    try {
        await controller.stop(req, res);
    } catch (err) {
        console.error("Erreur lors de l'arrêt du serveur :", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /api/serveurs/installation/
router.post("/installation/", middlewareAuth.handle.bind(middlewareAuth), async (req, res) => {
    try {
        await controller.install(req, res);
    } catch (err) {
        console.error("Erreur lors de l'installation du serveur :", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
