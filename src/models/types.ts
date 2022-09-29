import Coordinates from './Coordinates'

/**
 * A range is a tuple of two coordinates.
 * The first coordinate is the top-left corner of the range, inclusive.
 * The second is the bottom-right corner of the range, inclusive.
 *
 * Since both bounds are inclusive, by definition this range cannot be empty.
 */
export type Range = [Coordinates, Coordinates]
