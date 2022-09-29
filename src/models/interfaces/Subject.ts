import Observer from './Observer'

/**
 * Represents a generic subject that can attach and detach observers that are ready to receive data updates of a certain type
 */
interface Subject<T> {
  attachObserver(observer: Observer<T>): void
  detachObserver(observer: Observer<T>): void
}

export default Subject
