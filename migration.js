/*
 * INF4375 - TP1
 * SEIJ04019006
 */

//libraries
var fs = require('fs');
var xmldom = require('xmldom');
var mongo = require('mongodb');

//parametres pour bd
var ip = 'localhost';
var port = 27017;
var bd = 'SEIJ04019006';

//fichiers a manipuler
var d_xml = 'dossiers.xml';
var p_xml = 'professionnels.xml';
var v_xml = 'visites.xml';

//conteneurs elements lus
var dossiers = [];
var professionnels = [];
var visites = [];

//conteneurs elements a inserer dans collections
//dossiers
var d_collection = [];

//professionnels
var p_collection = [];

// RECUPERATION DES DONNEES DANS LES FICHIERS XML

//recuperation des dossiers
function recuperer_dossiers(callback) {

    fs.readFile(d_xml, function(err, d_data) {

        if (!err) {

            var dom = new xmldom.DOMParser().parseFromString(d_data.toString());
            var liste = dom.getElementsByTagName('dossier');

            if (liste.length == 0) {

                console.log('Auncun dossier dans le fichier.');

            } else {

                for (i = 0; i < liste.length; i++) {

                    var curseur = liste[i];

                    //champ d'un dossier
                    var id = curseur.getElementsByTagName('id')[0].textContent;
                    var sexe = curseur.getElementsByTagName('sexe')[0].textContent;
                    var nom = curseur.getElementsByTagName('nom')[0].textContent;
                    var prenom = curseur.getElementsByTagName('prenom')[0].textContent;
                    var date = curseur.getElementsByTagName('dateNaissance')[0].textContent;
                    var groupe = curseur.getElementsByTagName('groupeSanguin')[0].textContent;
                    var poids = curseur.getElementsByTagName('poidsKg')[0].textContent;
                    var taille = curseur.getElementsByTagName('tailleCm')[0].textContent;
                    var don = curseur.getElementsByTagName('donOrganes')[0].textContent;


                    var dossier = {
                        _id: id,
                        sexe: sexe,
                        nom: nom,
                        prenom: prenom,
                        date_naissance: date,
                        groupe_sanguin: groupe,
                        poids_kg: poids,
                        taille_cm: taille,
                        don_organes: don
                    };

                    dossiers.push(dossier);

                }

                callback();

            }

        } else {
            console.log('Erreur de lecture ! Fichier : ' + d_xml);
        }

    });
}

//recuperation des professionnels
function recuperer_professionnels(callback) {

    fs.readFile(p_xml, function(err, p_data) {

        if (!err) {

            var dom = new xmldom.DOMParser().parseFromString(p_data.toString());
            var liste = dom.getElementsByTagName('professionnel');

            if (liste.length == 0) {

                console.log('Auncun professionnel dans le fichier.');

            } else {

                for (var i = 0; i < liste.length; i++) {

                    var curseur = liste[i];

                    //champ d'un professionnel
                    var id = curseur.getElementsByTagName('id')[0].textContent;
                    var sexe = curseur.getElementsByTagName('sexe')[0].textContent;
                    var nom = curseur.getElementsByTagName('nom')[0].textContent;
                    var prenom = curseur.getElementsByTagName('prenom')[0].textContent;
                    var specialite = curseur.getElementsByTagName('specialite')[0].textContent;

                    var professionnel = {
                        _id: id,
                        sexe: sexe,
                        nom: nom,
                        prenom: prenom,
                        specialite: specialite
                    };

                    professionnels.push(professionnel);

                }

                callback();

            }

        } else {
            console.log('Erreur de lecture ! Fichier : ' + p_xml);
        }

    });
}

//recuperation des visites
function recuperer_visites(callback) {

    fs.readFile(v_xml, function(err, v_data) {

        if (!err) {

            var dom = new xmldom.DOMParser().parseFromString(v_data.toString());
            var liste = dom.getElementsByTagName('visite');

            if (liste.length == 0) {

                console.log('Auncune visite dans le fichier.');

            } else {

                for (var i = 0; i < liste.length; i++) {

                    var curseur = liste[i];

                    //champ d'un professionnel
                    var pro = curseur.getElementsByTagName('professionnel')[0].textContent;
                    var pat = curseur.getElementsByTagName('patient')[0].textContent;
                    var dat = curseur.getElementsByTagName('date')[0].textContent;

                    var visite = {
                        professionnel: pro,
                        patient: pat,
                        date: dat
                    };

                    visites.push(visite);

                }

                callback();

            }

        } else {
            console.log('Erreur de lecture ! Fichier : ' + v_xml);
        }

    });
}

function obtenir_professionnel(id) {
    var pro;

    for (var i = 0; i < professionnels.length; i++) {

        if (professionnels[i]._id == id) {

            pro = professionnels[i];
            break;

        }

    }
    return pro;
}

function obtenir_liste_visites(id) {
    var v = [];

    for (var i = 0; i < visites.length; i++) {

        if (visites[i].patient == id) {

            var pro = obtenir_professionnel(visites[i].professionnel);

            var visite = {
                date: visites[i].date,
                nom: pro.nom,
                prenom: pro.prenom,
                specialite: pro.specialite
            }

            v.push(visite);
        }

    }
    return v;
}

function generer_collection_dossiers() {

    for (var i = 0; i < dossiers.length; i++) {

        var dossier = {
            _id: dossiers[i]._id,
            sexe: dossiers[i].sexe,
            nom: dossiers[i].nom,
            prenom: dossiers[i].prenom,
            date_naissance: dossiers[i].date_naissance,
            groupe_sanguin: dossiers[i].groupe_sanguin,
            poids_kg: dossiers[i].poids_kg,
            taille_cm: dossiers[i].taille_cm,
            don_organes: dossiers[i].don_organes,
            visites: []
        };

        var v = obtenir_liste_visites(dossiers[i]._id);

        dossier.visites = v;

        d_collection.push(dossier);
    }
}

function obtenir_nbr_visites(id) {
    var nbr = 0;

    for (var i = 0; i < visites.length; i++) {

        if (visites[i].professionnel == id) {
            nbr++;
        }

    }
    return nbr;
}

function supprimer_duplicats(array) {
    var temp = {};
    var tmp = [];

    for (var i = 0; i < array.length; i++) {
        temp[array[i]] = array[i];
    }

    for (var key in temp) {
        tmp.push(key);
    }
    return tmp;
}

function obtenir_nbr_patients(id) {
    var nbr = 0;
    var patients = [];

    for (var i = 0; i < visites.length; i++) {

        if (visites[i].professionnel == id) {

            patients.push(visites[i].patient);

        }
    }

    var tmp = supprimer_duplicats(patients);
    nbr = tmp.length;
    return nbr;
}

function obtenir_liste_patients_2014(id) {
    var result = [];
    var tmp = [];

    for (var i = 0; i < visites.length; i++) {
        var patt = /2014/;

        if ((patt.test(visites[i].date)) && (visites[i].professionnel == id)) {

            tmp.push(visites[i].patient);

        }
    }

    var patients = supprimer_duplicats(tmp);

    for (var j = 0; j < patients.length; j++) {

        for (var i = 0; i < dossiers.length; i++) {

            if (dossiers[i]._id == patients[j]) {

                var patient = {
                    _id: dossiers[i]._id,
                    nom: dossiers[i].nom,
                    prenom: dossiers[i].prenom
                };

                result.push(patient);
                break;
            }
        }
    }

    return result;
}

function generer_collection_professionnels() {

    for (var i = 0; i < professionnels.length; i++) {

        var professionnel = {
            _id: professionnels[i]._id,
            sexe: professionnels[i].sexe,
            nom: professionnels[i].nom,
            prenom: professionnels[i].prenom,
            specialite: professionnels[i].specialite,
            patients_2014: [],
            nbr_patients: 0,
            nbr_visites: 0
        };

        var p_2014 = obtenir_liste_patients_2014(professionnels[i]._id);
        var nbr_p = obtenir_nbr_patients(professionnels[i]._id);
        var nbr_v = obtenir_nbr_visites(professionnels[i]._id);

        professionnel.patients_2014 = p_2014;
        professionnel.nbr_patients = nbr_p;
        professionnel.nbr_visites = nbr_v;

        p_collection.push(professionnel);

    }
}

//OPERATIONS AVEC LA BD
function migrer_vers_mongo() {

    var server = new mongo.Server(ip, port);
    var db = new mongo.Db(bd, server, {safe: true});

    db.open(function(err, db) {

        if (!err) {

            db.createCollection("dossiers", function() {

                db.collection("dossiers", function(err, collection) {

                    if (!err) {

                        collection.insert(d_collection, function(err, data) {

                            db.createCollection("professionnels", function() {

                                db.collection("professionnels", function(err, collection) {

                                    if (!err) {

                                        collection.insert(p_collection, function(err, data) {

                                            db.close();
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            });
        }
    });
}

//appel des fonctions pour excuter le script
recuperer_dossiers(function() {

    recuperer_professionnels(function() {

        recuperer_visites(function() {

            generer_collection_dossiers();
            generer_collection_professionnels();

            migrer_vers_mongo();

        });
    });
});
