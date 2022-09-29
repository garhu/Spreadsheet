import { useState, useEffect } from 'react'
import Subject from '../models/interfaces/Subject'
import Observer from '../models/interfaces/Observer'

class GenericObserver<T> implements Observer<T> {
  constructor(private callback: (obj: T) => void) {}

  handleUpdate(obj: T) {
    this.callback(obj)
  }
}

/**
 * A hook used to attach an observer to a subject, causing the subject to be dynamically updated
 * @param subject of type Subject<T>
 * @param initialValue the initial value of the observable value
 * @returns the observable value
 */
export const useObserver = <T extends unknown>(
  subject: Subject<T>,
  initialValue: T | undefined
) => {
  const [value, setValue] = useState<T | undefined>(initialValue)
  useEffect(() => {
    const observer = new GenericObserver((obj: T) => setValue(obj))
    subject.attachObserver(observer)
    return () => {
      subject.detachObserver(observer)
    }
  }, [subject])

  return value
}
