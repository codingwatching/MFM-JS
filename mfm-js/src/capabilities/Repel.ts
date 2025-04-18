import { Element } from "../mfm/Element";
import { EventWindow, EWIndex } from "../mfm/EventWindow";
import { Wayfinder } from "../mfm/Wayfinder";

export class Repel {
  static NAME: string = "REPEL";

  static CREATE(repelType: string, repelSites: EWIndex[], escapeType: string = "EMPTY", escapeSites: EWIndex[]) {
    return (ew: EventWindow): boolean => {
      let swapped = false;
      if (ew.any(repelSites, repelType)) {
        const escapes = ew.filterByType(escapeSites, escapeType);
        if (escapes.length) swapped = ew.swap(ew.random(escapes));
      }
      return swapped;
    };
  }

  static FAR_NORTH(ew: EventWindow, repelType: string | string[], escapeType: string | string[] = "EMPTY"): boolean {
    if (EventWindow.oneIn(5) && ew.is(3, repelType) && ew.is(10, escapeType)) {
      ew.swap(10);
    }
    return true;
  }

  static MAKE_REPELLER(
    _repelTypes: string | string[],
    fromIndexes: EWIndex[] = [1, 2, 3, 4, 5, 6, 7, 8],
    toIndexes: EWIndex[] = [37, 38, 39, 40, 25, 26, 27, 28]
  ) {
    return (ew: EventWindow, self: Element): boolean => {
      const repelTypes = self.state.repelTypes ?? _repelTypes;

      if (fromIndexes.length > toIndexes.length) {
        throw new Error("fromSet must be less than or equal to length of toSet");
      }

      const repellers: EWIndex[] = ew.filter(fromIndexes, repelTypes);
      const emptyDests: EWIndex[] = ew.filter(toIndexes, "EMPTY");

      if (repellers.length && emptyDests.length) {
        const repelMap = Object.fromEntries(
          fromIndexes.map((fi, i) => {
            return [fi, toIndexes[i]];
          })
        );

        let moved = false;

        repellers.forEach((target) => {
          if (!moved) {
            const toSite: EWIndex = repelMap[target];
            //try to repel in the opposing direction
            if (emptyDests.includes(toSite)) {
              moved = ew.move(toSite, undefined, target);
            } else {
              //otherwise just repel it anywhere available in the toSet!
              const empty = EventWindow.RANDOM(emptyDests);
              moved = ew.move(empty, undefined, target);
            }
          }
        });

        return moved;
      }

      return false;
    };
  }

  static MAKE_AVOIDER(
    _repelTypes: string | string[],
    fromIndexes: EWIndex[] = [1, 2, 3, 4, 5, 6, 7, 8],
    toIndexes: EWIndex[] = [40, 39, 38, 37, 28, 27, 26, 25]
  ) {
    return (ew: EventWindow, self: Element): boolean => {
      const repelTypes = self.state.repelTypes ?? _repelTypes;

      if (fromIndexes.length > toIndexes.length) {
        throw new Error("fromSet must be less than or equal to length of toSet");
      }

      const repellers: EWIndex[] = ew.filter(fromIndexes, repelTypes);
      const emptyDests: EWIndex[] = ew.filter(toIndexes, "EMPTY");

      if (repellers.length && emptyDests.length) {
        const repelMap = Object.fromEntries(
          fromIndexes.map((fi, i) => {
            return [fi, toIndexes[i]];
          })
        );

        let moved = false;
        repellers.forEach((target) => {
          if (!moved) {
            // const toSite: EWIndex = repelMap[target];
            //try to avoid in the opposing direction
            // if (emptyDests.includes(toSite)) {
            // moved = ew.move(toSite);
            // } else {
            //otherwise just avoid it anywhere available in the toSet!
            moved = ew.move(EventWindow.RANDOM(emptyDests));
            // }
          }
        });

        return moved;
      }

      return false;
    };
  }

  static MAKE_ATTRACTOR(_attractTypes: string | string[], view: EWIndex[] = EventWindow.ALLADJACENT) {
    return (ew: EventWindow, self: Element): boolean => {
      const attractTypes = self.state.attractTypes ?? _attractTypes;
      const swapTypes = self.state.swapTypes ?? ["EMPTY"];

      const attractors: EWIndex[] = ew.filter(view, attractTypes);

      if (attractors.length) {
        const attractor = EventWindow.RANDOM(attractors);
        const towardIndexes: EWIndex[] = Wayfinder.getInFront(Wayfinder.indexToDirection(attractor), true);
        const swapDests: EWIndex[] = ew.filter(towardIndexes, swapTypes);

        if (swapDests.length) {
          //sort by nearest index to the target attractor
          swapDests.sort((a, b) => Math.abs(attractor - a) - Math.abs(attractor - b)).slice(~~(swapDests.length / 2));
          // return ew.swap(swapDests[0]);
          return ew.swap(EventWindow.RANDOM(swapDests));
        }
      }

      return false;
    };
  }
}
