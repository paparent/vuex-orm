import { Schema as NormalizrSchema } from 'normalizr'
import Schema from '../../schema/Schema'
import { Record, Records, NormalizedData } from '../../data'
import Model from '../../model/Model'
import Query from '../../query/Query'
import Relation from './Relation'

export default class HasManyBy extends Relation {
  /**
   * The related model.
   */
  parent: typeof Model

  /**
   * The foregin key of the model.
   */
  foreignKey: string

  /**
   * The associated key on the parent model.
   */
  ownerKey: string

  /**
   * Create a new has many by instance.
   */
  constructor (model: typeof Model, parent: typeof Model | string, foreignKey: string, ownerKey: string) {
    super(model) /* istanbul ignore next */

    this.parent = this.model.relation(parent)
    this.foreignKey = foreignKey
    this.ownerKey = ownerKey
  }

  /**
   * Define the normalizr schema for the relationship.
   */
  define (schema: Schema): NormalizrSchema {
    return schema.many(this.parent)
  }

  /**
   * Attach the relational key to the given data.
   */
  attach (key: any, record: Record, _data: NormalizedData): void {
    if (key.length === 0) {
      return
    }
    if (record[this.foreignKey] !== undefined) {
      return
    }

    record[this.foreignKey] = key
  }

  /**
   * Validate the given value to be a valid value for the relationship.
   */
  fill (value: any): (string | number)[] {
    return this.fillMany(value)
  }

  /**
   * Make value to be set to model property. This method is used when
   * instantiating a model or creating a plain object from a model.
   */
  make (value: any, _parent: Record, _key: string, plain: boolean = false): Model[] | Record[] {
    if (value === null) {
      return []
    }

    if (value === undefined) {
      return []
    }

    if (!Array.isArray(value)) {
      return []
    }

    if (value.length === 0) {
      return []
    }

    return value.filter((record) => {
      return record && typeof record === 'object'
    }).map((record) => {
      return this.parent.make(record, plain)
    })
  }

  /**
   * Load the has many by relationship for the collection.
   */
  load (query: Query, collection: Record[], key: string): void {
    const relatedQuery = this.getRelation(query, this.parent.entity)

    this.addConstraintForHasManyBy(relatedQuery, collection)

    const relations = this.mapSingleRelations(relatedQuery.get(), this.ownerKey)

    collection.forEach((item) => {
      const related = this.getRelatedRecords(relations, item[this.foreignKey])

      item[key] = related
    })
  }

  /**
   * Set the constraints for an eager load of the relation.
   */
  addConstraintForHasManyBy (query: Query, collection: Record[]): void {
    const keys = collection.reduce<string[]>((keys, item) => {
      return keys.concat(item[this.foreignKey])
    }, [] as string[])

    query.where(this.ownerKey, keys)
  }

  /**
   * Get related records.
   */
  getRelatedRecords (records: Records, keys: string[]): Record[] {
    return keys.reduce<Record[]>((items, id) => {
      const related = records[id]

      related && items.push(related)

      return items
    }, [] as Record[])
  }
}
