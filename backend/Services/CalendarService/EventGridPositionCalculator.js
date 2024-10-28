import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class EventGridPositionCalculator {
    calculate(input) {
        const { plannings, events, totalColumnsPerPlanning, collisions, offsetFromDayStart, stepDuration, planningGridIndexes } = input;

        // Fonction principale pour calculer les positions de la grille d'événements pour chaque planning
        plannings.forEach(planning => {
            planning.eventGridPositions = {};
            const { calendar_events, staff_id } = planning;

            const planningCollisions = collisions.internal[staff_id];
            const totalColumns = totalColumnsPerPlanning;
            const startIndex = planningGridIndexes[staff_id].colIndex;

            let columnOccupancy = Array(totalColumns).fill(false); // Occupation des colonnes pour cet événement

            calendar_events.forEach(eventId => {
                const event = events[eventId];
                planning.eventGridPositions[eventId] = this.eventGridRowPosition(event, stepDuration, offsetFromDayStart);

                // Assigne les colonnes pour chaque événement en utilisant `startIndex`
                const { colStart, colEnd } = this.assignColumnsForEvent(eventId, planning, planningCollisions, columnOccupancy, startIndex, totalColumns);
                planning.eventGridPositions[eventId].colStart = colStart;
                planning.eventGridPositions[eventId].colEnd = colEnd;
            });
        });
    }

    eventGridRowPosition(event, stepDuration, offsetFromDayStart) {
        // Fonction pour calculer les positions de ligne d'un événement dans la grille

        const startDate = event.date;
        const endDate = DateMethod.addMinutes(event.date, event.duration);

        return {
            rowStart: this.getRowPositionFromDate(startDate, stepDuration) - offsetFromDayStart,
            rowEnd: this.getRowPositionFromDate(endDate, stepDuration) - offsetFromDayStart
        };
    }
    markColumnsAsOccupied(columnOccupancy, colStart, colEnd) {
        // Marque les colonnes comme occupées
        columnOccupancy[colStart - 1] = true; // 0-based
        columnOccupancy[colEnd - 1] = true;
    }

    assignColumnsForEvent(eventId, planning, planningCollisions, columnOccupancy, startIndex, totalColumns) {
        // Fonction pour assigner les colonnes en fonction des collisions et de l'index de départ du planning

        const eventCollisionInfo = planningCollisions.crossEvent.find(
            collision => collision.referenceEvent === eventId || collision.comparedToEvent === eventId
        );


        if (eventCollisionInfo) {
            let colStart = this.findAvailableColumnPair(columnOccupancy, startIndex);
            if (colStart !== -1) {
                const colEnd = colStart + 1;
                this.markColumnsAsOccupied(columnOccupancy, colStart, colEnd);
                return { colStart, colEnd: colEnd + 1 }; // End exclusive
            }
        }
        // Par défaut, si pas de collision, occupe toutes les colonnes à partir de `startIndex`
        return { colStart: startIndex, colEnd: startIndex + totalColumns };
    }

    findAvailableColumnPair(columnOccupancy, startIndex) {
        // Fonction pour trouver une paire de colonnes libres à partir de l'index de départ

        for (let i = startIndex; i < columnOccupancy.length; i += 2) {
            if (!columnOccupancy[i] && !columnOccupancy[i + 1]) {
                return i + 1; // 1-based index for CSS Grid
            }
        }
        return -1; // Pas de paire libre
    }


    getRowPositionFromDate(date, stepDuration) {
        return (date.getHours() * 60 + date.getMinutes()) / stepDuration;
    };
}