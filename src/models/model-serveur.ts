// src/models/model-serveur.ts

import {ServeurInterface} from "../interfaces/ServeurInterfaces";
import {RepositoryServeur} from "../repositories/repository-serveur";
import {ServiceServeur} from "../services/service-serveur";
import {Model} from "./Model";
import {RepositoryServeurParameters} from "../repositories/repository-serveur_parameters";
import {ServeurParametersInterface} from "../interfaces/ServeurParametersInterfaces";

/**
 * Represents a server model that interacts with server-related data and logic.
 * Inherits from the `Model` class and implements the `ServeurInterface`.
 * Used to manage server metadata, functionality, and lifecycle.
 *
 * - `nom`: The name of the server.
 * - `jeu`: The game associated with the server.
 * - `version`: The version of the game being played on the server.
 * - `modpack`: The modpack used on the server.
 * - `modpack_url`: The URL where the modpack can be downloaded.
 * - `nom_monde`: The name of the world on the server.
 * - `embed_color`: The color used for embeds related to the server.
 * - `path_serv`: The path to the server's files.
 * - `start_script`: The script used to start the server.
 * - `actif`: Indicates if the server is active.
 * - `global`: Indicates if the server is global.
 * - `players_online`: The number of online players on the server.
 */

export class ModelServeur extends Model implements ServeurInterface {

    nom: string;
    jeu: string;
    version: string;
    modpack: string;
    modpack_url: string;
    nom_monde: string;
    embed_color: string;
    contenaire: string;
    description: string;
    actif: boolean;
    global: boolean;
    players_online?: number;
    type: string;
    image: string

    // Constructeur de la classe Serveur
    constructor(data: Partial<ServeurInterface>) {
        super(data);
        this.nom = data.nom ?? "";
        this.jeu = data.jeu ?? "";
        this.version = data.version ?? "";
        this.modpack = data.modpack ?? "";
        this.modpack_url = data.modpack_url ?? "";
        this.nom_monde = data.nom_monde ?? "";
        this.embed_color = data.embed_color ?? "#000000";
        this.contenaire = data.contenaire ?? "";
        this.description = data.description ?? "";
        this.actif = data.actif ?? false;
        this.global = data.global ?? false;
        this.type = data.type ?? "";
        this.image = data.image ?? "";
    }

    // Initialisation du repository Serveur
    private static readonly serveursRepository = new RepositoryServeur();

    // Initialisation du repository Serveur Parameters
    private static readonly serveursParametersRepository = new RepositoryServeurParameters();

    // Initialisation du service Serveur
    private static readonly serveursService = new ServiceServeur();

    // Méthode qui permet de convertir le model en JSON
    toJSON(): Partial<ServeurInterface> {
        return {
            id: this.id,
            nom: this.nom,
            jeu: this.jeu,
            version: this.version,
            modpack: this.modpack,
            modpack_url: this.modpack_url,
            nom_monde: this.nom_monde,
            embed_color: this.embed_color,
            contenaire: this.contenaire,
            description: this.description,
            actif: this.actif,
            global: this.global,
            type: this.type,
            image: this.image,
        };
    }

    // Méthode de récupération de l'ensemble des serveurs
    static async getAll(): Promise<ModelServeur[]> {
        const serveurs = await ModelServeur.serveursRepository.findAll();
        return serveurs.map(data => new ModelServeur(data));
    }

    // Méthode de récupération d'un serveur par son ID
    static async getById(id: number): Promise<ModelServeur | null> {
        const serveur = await ModelServeur.serveursRepository.findById(id);
        return serveur ? new ModelServeur(serveur) : null;
    }

    // Méthode de récupération des ID des serveurs primaire et secondaire
    static async getStartedServeursId(): Promise<ServeurParametersInterface | null> {
        return await ModelServeur.serveursParametersRepository.getServeursId();
    }

// Méthode pour récupérer seulement les serveurs actifs et globaux
    static async getServeursActifGlobal(): Promise<ModelServeur[]> {
        // 1. Récupération brute des données via ton repository
        const serveurs = await ModelServeur.serveursRepository.findAll();

        // 2. Filtrage des serveurs actifs et globaux
        const serveursActifGlobal = serveurs.filter(
            (serveur: ServeurInterface) => serveur.actif && serveur.global
        );

        // 3. Conversion en instances de ModelServeur si besoin
        return serveursActifGlobal.map((data: ServeurInterface) => new ModelServeur(data));
    }


    static async getServeursActifGlobalByGame(game : string): Promise<ModelServeur[]> {
        // 1. Récupération brute des données via ton repository
        const serveurs = await ModelServeur.serveursRepository.findAll();

        // 2. Filtrage des serveurs actifs et globaux
        const serveursActifGlobal = serveurs.filter(
            (serveur: ServeurInterface) => serveur.actif && serveur.global && serveur.jeu.toLowerCase() === game.toLowerCase()
        );

        // 3. Conversion en instances de ModelServeur si besoin
        return serveursActifGlobal.map((data: any) => new ModelServeur(data));
    }

    // Méthode de récupération des informations des serveurs primaire et secondaire
    static async getStartedServeursInfo(): Promise<ModelServeur[] | null> {
        const serveursStartedId = await ModelServeur.getStartedServeursId();

        // Vérification si les serveurs primaire et secondaire existent
        if (serveursStartedId) {
            const serveursPrimary = await ModelServeur.getById(serveursStartedId.id_serv_primaire);
            const serveursSecondaire = await ModelServeur.getById(serveursStartedId.id_serv_secondaire);

            // Ajout de la propriété nb_players pour chaque serveur
            if (serveursPrimary) {
                serveursPrimary.players_online = await ModelServeur.serveursService.getPlayersCount(serveursPrimary);
            }
            if (serveursSecondaire) {
                serveursSecondaire.players_online = await ModelServeur.serveursService.getPlayersCount(serveursSecondaire);
            }

            if (serveursPrimary && serveursSecondaire) {
                return [serveursPrimary, serveursSecondaire];
            }
            return null;
        }
        return null;
    }

    // Méthode de création d'un serveur
    static async create(data: Partial<ServeurInterface>): Promise<ModelServeur> {
        const nextId = await ModelServeur.serveursRepository.getNextId();
        const serveur = new ModelServeur({ ...data, id: nextId });
        await ModelServeur.serveursRepository.save(serveur);
        return serveur;
    }

    // Méthode de suppression d'un serveur 
    static async delete(id: number): Promise<boolean> {
        const deleted = await ModelServeur.serveursRepository.delete(id);
        return deleted;
    }

    // ---------------- MÉTHODES GESTION DU LANCEMENT / ARRET DU SERVEUR / INSTALLATION ------------------

    // Méthode de lancement du serveur
    static async start(serveur: ModelServeur): Promise<boolean> {
        if (await ModelServeur.serveursParametersRepository.updateActifServeur(serveur.id)) {
            return true;
        } else {
            return false;
        }
    }

    // ---------------------------------------------------------------------------------------------------

}
