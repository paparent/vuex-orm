import * as Vuex from 'vuex'
import Utils from '../support/Utils'
import Container from '../connections/Container'
import Connection from '../connections/Connection'
import { Record, Records } from '../data'
import { Fields } from '../attributes/contracts/Contract'
import Attribute from '../attributes/Attribute'
import Attr from '../attributes/types/Attr'
import String from '../attributes/types/String'
import Number from '../attributes/types/Number'
import Boolean from '../attributes/types/Boolean'
import Increment from '../attributes/types/Increment'
import HasOne from '../attributes/relations/HasOne'
import BelongsTo from '../attributes/relations/BelongsTo'
import HasMany from '../attributes/relations/HasMany'
import HasManyBy from '../attributes/relations/HasManyBy'
import HasManyThrough from '../attributes/relations/HasManyThrough'
import BelongsToMany from '../attributes/relations/BelongsToMany'
import MorphTo from '../attributes/relations/MorphTo'
import MorphOne from '../attributes/relations/MorphOne'
import MorphMany from '../attributes/relations/MorphMany'
import MorphToMany from '../attributes/relations/MorphToMany'
import MorphedByMany from '../attributes/relations/MorphedByMany'
import Query from '../query/Query'
import Item from '../query/Item'
import Collection from '../query/Collection'
import EntityCollection from '../query/EntityCollection'
import * as Payloads from '../modules/Payloads'

export default class Model {
  /**
   * Name of the connection that this model is registerd.
   */
  static connection: string

  /**
   * The name that is going be used as module name in Vuex Store.
   */
  static entity: string

  /**
   * The primary key to be used for the model.
   */
  static primaryKey: string | string[] = 'id'

  /**
   * Dynamic properties that field data should be assigned at instantiation.
   */
  ;[key: string]: any

  /**
   * Create a model instance.
   */
  constructor (record?: Record) {
    this.$fill(record)
  }

  /**
   * The definition of the fields of the model and its relations.
   */
  static fields (): Fields {
    return {}
  }

  /**
   * Create an attr attribute. The given value will be used as a default
   * value for the field.
   */
  static attr (value: any, mutator?: (value: any) => any): Attr {
    return new Attr(this, value, mutator)
  }

  /**
   * Create a string attribute.
   */
  static string (value: any, mutator?: (value: any) => any): String {
    return new String(this, value, mutator)
  }

  /**
   * Create a number attribute.
   */
  static number (value: any, mutator?: (value: any) => any): Number {
    return new Number(this, value, mutator)
  }

  /**
   * Create a boolean attribute.
   */
  static boolean (value: any, mutator?: (value: any) => any): Boolean {
    return new Boolean(this, value, mutator)
  }

  /**
   * Create an increment attribute. The field with this attribute will
   * automatically increment its value when creating a new record.
   */
  static increment (): Increment {
    return new Increment(this)
  }

  /**
   * Create a has one relationship.
   */
  static hasOne (related: typeof Model | string, foreignKey: string, localKey?: string): HasOne {
    return new HasOne(this, related, foreignKey, this.localKey(localKey))
  }

  /**
   * Create a belongs to relationship.
   */
  static belongsTo (parent: typeof Model | string, foreignKey: string, ownerKey?: string): BelongsTo {
    return new BelongsTo(this, parent, foreignKey, this.relation(parent).localKey(ownerKey))
  }

  /**
   * Create a has many relationship.
   */
  static hasMany (related: typeof Model | string, foreignKey: string, localKey?: string): HasMany {
    return new HasMany(this, related, foreignKey, this.localKey(localKey))
  }

  /**
   * Create a has many by relationship.
   */
  static hasManyBy (parent: typeof Model | string, foreignKey: string, ownerKey?: string): HasManyBy {
    return new HasManyBy(this, parent, foreignKey, this.relation(parent).localKey(ownerKey))
  }

  /**
   * Create a has many through relationship.
   */
  static hasManyThrough (
    related: typeof Model | string,
    through: typeof Model | string,
    firstKey: string,
    secondKey: string,
    localKey?: string,
    secondLocalKey?: string
  ): HasManyThrough {
    return new HasManyThrough(
      this,
      related,
      through,
      firstKey,
      secondKey,
      this.localKey(localKey),
      this.relation(through).localKey(secondLocalKey)
    )
  }

  /**
   * The belongs to many relationship.
   */
  static belongsToMany (
    related: typeof Model | string,
    pivot: typeof Model | string,
    foreignPivotKey: string,
    relatedPivotKey: string,
    parentKey?: string,
    relatedKey?: string
  ): BelongsToMany {
    return new BelongsToMany(
      this,
      related,
      pivot,
      foreignPivotKey,
      relatedPivotKey,
      this.localKey(parentKey),
      this.relation(related).localKey(relatedKey)
    )
  }

  /**
   * Create a morph to relationship.
   */
  static morphTo (id: string, type: string): MorphTo {
    return new MorphTo(this, id, type)
  }

  /**
   * Create a morph one relationship.
   */
  static morphOne (related: typeof Model | string, id: string, type: string, localKey?: string): MorphOne {
    return new MorphOne(this, related, id, type, this.localKey(localKey))
  }

  /**
   * Create a morph many relationship.
   */
  static morphMany (related: typeof Model | string, id: string, type: string, localKey?: string): MorphMany {
    return new MorphMany(this, related, id, type, this.localKey(localKey))
  }

  /**
   * Create a morph to many relationship.
   */
  static morphToMany (
    related: typeof Model | string,
    pivot: typeof Model | string,
    relatedId: string,
    id: string,
    type: string,
    parentKey?: string,
    relatedKey?: string
  ): MorphToMany {
    return new MorphToMany(
      this,
      related,
      pivot,
      relatedId,
      id,
      type,
      this.localKey(parentKey),
      this.relation(related).localKey(relatedKey)
    )
  }

  /**
   * Create a morphed by many relationship.
   */
  static morphedByMany (
    related: typeof Model | string,
    pivot: typeof Model | string,
    relatedId: string,
    id: string,
    type: string,
    parentKey?: string,
    relatedKey?: string
  ): MorphedByMany {
    return new MorphedByMany(
      this,
      related,
      pivot,
      relatedId,
      id,
      type,
      this.localKey(parentKey),
      this.relation(related).localKey(relatedKey)
    )
  }

  /**
   * Mutators to mutate matching fields when instantiating the model.
   */
  static mutators (): { [field: string]: (value: any) => any } {
    return {}
  }

  /**
   * Get connection instance out of the container.
   */
  static conn (): Connection {
    return Container.connection(this.connection)
  }

  /**
   * Get Vuex Store instance out of connection.
   */
  static store (): Vuex.Store<any> {
    return this.conn().store()
  }

  /**
   * Get module namespaced path for the model.
   */
  static namespace (method: string): string {
    return `${this.connection}/${this.entity}/${method}`
  }

  /**
   * Dispatch an action.
   */
  static dispatch (method: string, payload: any): Promise<any> {
    return this.store().dispatch(this.namespace(method), payload)
  }

  /**
   * Call getetrs.
   */
  static getters (method: string): any {
    return this.store().getters[this.namespace(method)]
  }

  /**
   * Create records.
   */
  static async create (payload: Payloads.CreatePayload): Promise<EntityCollection> {
    return this.dispatch('create', payload)
  }

  /**
   * Insert records.
   */
  static async insert (payload: Payloads.InsertPayload): Promise<EntityCollection> {
    return this.dispatch('insert', payload)
  }

  /**
   * Update records.
   */
  static async update (payload: Payloads.UpdatePayload): Promise<EntityCollection> {
    return this.dispatch('update', payload)
  }

  /**
   * Insert or update records.
   */
  static async insertOrUpdate (payload: Payloads.InsertOrUpdatePayload): Promise<EntityCollection> {
    return this.dispatch('insertOrUpdate', payload)
  }

  /**
   * Get all records.
   */
  static all (): Collection {
    return this.getters('all')()
  }

  /**
   * Find a record.
   */
  static find (id: string | number): Collection {
    return this.getters('find')(id)
  }

  /**
   * Get query instance.
   */
  static query (): Query {
    return this.getters('query')()
  }

  /**
   * Insert or update records.
   */
  static async delete (condition: Payloads.DeletePaylaod): Promise<Item | Collection> {
    return this.dispatch('delete', condition)
  }

  /**
   * Get the value of the primary key.
   */
  static id (record: any): any {
    const key = this.primaryKey

    if (typeof key === 'string') {
      return record[key]
    }

    return key.map(k => record[k]).join('_')
  }

  /**
   * Get local key to pass to the attributes.
   */
  static localKey (key?: string): string {
    if (key) {
      return key
    }

    return typeof this.primaryKey === 'string' ? this.primaryKey : 'id'
  }

  /**
   * Get a model from the container.
   */
  static relation (model: typeof Model | string): typeof Model {
    if (typeof model !== 'string') {
      return model
    }

    return this.conn().model(model)
  }

  /**
   * Get the attribute class for the given attribute name.
   */
  static getAttributeClass (name: string): typeof Attribute {
    switch (name) {
      case 'increment': return Increment

      default:
        throw Error(`The attribute name "${name}" doesn't exists.`)
    }
  }

  /**
   * Get all of the fields that matches the given attribute name.
   */
  static getFields (name: string): { [key: string]: Attribute } {
    const attr = this.getAttributeClass(name)
    const fields = this.fields()

    return Object.keys(fields).reduce((newFields, key) => {
      const field = fields[key]

      if (field instanceof attr) {
        newFields[key] = field
      }

      return newFields
    }, {} as { [key: string]: Attribute })
  }

  /**
   * Get all `increment` fields from the schema.
   */
  static getIncrementFields (): { [key: string]: Increment } {
    return this.getFields('increment') as { [key: string]: Increment }
  }

  /**
   * Check if fields contains the `increment` field type.
   */
  static hasIncrementFields (): boolean {
    return Object.keys(this.getIncrementFields()).length > 0
  }

  /**
   * Get all `belongsToMany` fields from the schema.
   */
  static pivotFields (): { [key: string]: BelongsToMany | MorphToMany | MorphedByMany }[] {
    const fields: { [key: string]: BelongsToMany | MorphToMany | MorphedByMany }[] = []

    Utils.forOwn(this.fields(), (field, key) => {
      if (field instanceof BelongsToMany || field instanceof MorphToMany || field instanceof MorphedByMany) {
        fields.push({ [key]: field })
      }
    })

    return fields
  }

  /**
   * Check if fields contains the `belongsToMany` field type.
   */
  static hasPivotFields (): boolean {
    return this.pivotFields().length > 0
  }

  /**
   * Create a new model instance.
   */
  static make (data: Record, plain: boolean = false): Model | Record {
    if (!plain) {
      return new this(data)
    }

    return this.fill({}, data, true)
  }

  /**
   * Create a new plain model record.
   */
  static makePlain (data: Record): Record {
    return this.make(data, true)
  }

  /**
   * Remove any fields not defined in the model schema. This method
   * also fixes any incorrect values as well.
   */
  static fix (data: Record, keep: string[] = ['$id']): Record {
    const fields = this.fields()

    return Object.keys(data).reduce((record, key) => {
      const value = data[key]
      const field = fields[key]

      if (keep.includes(key)) {
        record[key] = value

        return record
      }

      if (!field) {
        return record
      }

      record[key] = field.fill(value)

      return record
    }, {} as Record)
  }

  /**
   * Fix multiple records.
   */
  static fixMany (data: Records, keep?: string[]): Records {
    return Object.keys(data).reduce((records, id) => {
      records[id] = this.fix(data[id], keep)

      return records
    }, {} as Records)
  }

  /**
   * Fill any missing fields in the given data with the default
   * value defined in the model schema.
   */
  static hydrate (data: Record, keep: string[] = ['$id']): Record {
    const fields = this.fields()

    const record = Object.keys(fields).reduce((record, key) => {
      const field = fields[key]
      const value = data[key]

      record[key] = field.fill(value)

      return record
    }, {} as Record)

    return Object.keys(data).reduce((record, key) => {
      if (keep.includes(key) && data[key] !== undefined) {
        record[key] = data[key]
      }

      return record
    }, record)
  }

  /**
   * Fill multiple records.
   */
  static hydrateMany (data: Records, keep?: string[]): Records {
    return Object.keys(data).reduce((records, id) => {
      records[id] = this.hydrate(data[id], keep)

      return records
    }, {} as Records)
  }

  /**
   * Fill the given obejct with the given record. If no record were passed,
   * or if the record has any missing fields, each value of the fields will
   * be filled with its default value defined at model fields definition.
   */
  static fill (self: Model | Record = {}, record: Record = {}, plain?: boolean): Model | Record {
    const fields = this.fields()

    return Object.keys(fields).reduce((target, key) => {
      const field = fields[key]
      const value = record[key]

      target[key] = field.make(value, record, key, plain)

      return target
    }, self)
  }

  /**
   * Get the static class of this model.
   */
  $self (): typeof Model {
    return this.constructor as typeof Model
  }

  /**
   * The definition of the fields of the model and its relations.
   */
  $fields (): Fields {
    return this.$self().fields()
  }

  /**
   * Get the value of the primary key.
   */
  $id (): any {
    return this.$self().id(this)
  }

  /**
   * Get the connection instance out of the container.
   */
  $conn (): Connection {
    return this.$self().conn()
  }

  /**
   * Get Vuex Store insatnce out of connection.
   */
  $store (): Vuex.Store<any> {
    return this.$self().store()
  }

  /**
   * Get module namespaced path for the model.
   */
  $namespace (method: string): string {
    return this.$self().namespace(method)
  }

  /**
   * Dispatch an action.
   */
  $dispatch (method: string, payload: any): Promise<any> {
    return this.$self().dispatch(method, payload)
  }

  /**
   * Call getetrs.
   */
  $getters (method: string): any {
    return this.$self().getters(method)
  }

  /**
   * Create records.
   */
  async $create (payload: Payloads.CreatePayload): Promise<EntityCollection> {
    return this.$dispatch('create', payload)
  }

  /**
   * Create records.
   */
  async $insert (payload: Payloads.InsertPayload): Promise<EntityCollection> {
    return this.$dispatch('insert', payload)
  }

  /**
   * Update records.
   */
  async $update (payload: Payloads.UpdatePayload): Promise<EntityCollection> {
    if (payload.where !== undefined) {
      return this.$dispatch('update', payload)
    }

    if (this.$self().id(payload) === undefined) {
      return this.$dispatch('update', { where: this.$id(), data: payload })
    }

    return this.$dispatch('update', payload)
  }

  /**
   * Insert or update records.
   */
  async $insertOrUpdate (payload: Payloads.InsertOrUpdatePayload): Promise<EntityCollection> {
    return this.$dispatch('insertOrUpdate', payload)
  }

  /**
   * Get all records.
   */
  $all (): Collection {
    return this.$getters('all')()
  }

  /**
   * Find a record.
   */
  $find (id: string | number): Collection {
    return this.$getters('find')(id)
  }

  /**
   * Get query instance.
   */
  $query (): Query {
    return this.$getters('query')()
  }

  /**
   * Insert or update records.
   */
  async $delete (condition?: Payloads.DeletePaylaod): Promise<Item | Collection> {
    condition = condition === undefined ? this.$id() : condition

    return this.$dispatch('delete', condition)
  }

  /**
   * Fill the model instance with the given record. If no record were passed,
   * or if the record has any missing fields, each value of the fields will
   * be filled with its default value defined at model fields definition.
   */
  $fill (record?: Record): void {
    this.$self().fill(this, record)
  }

  /**
   * Serialize field values into json.
   */
  $toJson (): Record {
    return this.$self().makePlain(this)
  }
}
