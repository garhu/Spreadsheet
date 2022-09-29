/**
 * Represents a generic observer that can receive updates containing data of a specified type
 */
interface Observer<T> {
  /**
   * Handles the update. The semantic of this update is up to the implementation
   * @param data The data of the update
   */
  handleUpdate(data: T): void
}

export default Observer
