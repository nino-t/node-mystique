const tpl = require('@supersoccer/template')

const DATATYPES = [
  {
    name: 'number',
    datatypes: [ 'tinyint', 'smallint', 'int', 'bigint', 'mediumint', 'float', 'double', 'decimal' ],
    component: 'input'
  },
  {
    name: 'text',
    datatypes: [ 'tinytext', 'text', 'mediumtext', 'longtext' ],
    component: 'textarea'
  },
  {
    name: 'datetime',
    datatypes: [ 'date', 'datetime', 'timestamp', 'time' ],
    component: 'calendar'
  }
]

class Mystique {
  constructor (template) {
    this.render = this.render.bind(this)
  }

  render (req, res, next) {
    res.mystique = (data) => {
      data = this.meta(data)
      res.marko(tpl.load('mystique'), { dataset: data })
    }
    next()
  }

  meta (dataset) {
    let resources = []

    for (let resource of dataset.data) {
      let _resource = []
      for (let attribute of dataset.descriptions) {
        const { datatype, datatypeGroup, component } = this.datatype(attribute)
        let _attr = {
          name: attribute.Field,
          label: this.label(attribute.Field),
          value: this.value(resource, attribute.Field),
          optional: attribute.Null === 'YES',
          default: attribute.default || '',
          length: this.length(attribute.Type),
          datatype: datatype,
          datatypeGroup: datatypeGroup,
          component: component
        }

        _resource.push(_attr)
      }
      resources.push(_resource)
    }

    dataset.data = resources
    console.log(dataset.data)
    return dataset
  }

  datatype (attribute) {
    const datatype = attribute.Type.replace(/[^a-z]+.*/gi, '')
    let component = 'input'
    let datatypeGroup

    for (let _datatype of DATATYPES) {
      if (_datatype.datatypes.indexOf(datatype.toLowerCase()) >= 0) {
        component = _datatype.component
        if (attribute.Comment.split(' ').indexOf('bool') >= 0) {
          component = 'toggle'
        }

        datatypeGroup = _datatype.name
        break
      }
    }

    return {
      datatype: datatype,
      component: component,
      datatypeGroup: datatypeGroup
    }
  }

  value (resource, attribute) {
    if (attribute === 'id') {
      return resource[attribute]
    }
    return resource.attributes[attribute]
  }

  label (name) {
    return name.replace(/[_]+/g, ' ').split(' ').map((val) => {
      if (val === 'id') {
        return 'ID'
      }
      return val[0].toUpperCase() + val.slice(1)
    }).join(' ')
  }

  length (name) {
    return name.replace(/[^0-9]+/g, '') || 0
  }
}

module.exports = new Mystique()
