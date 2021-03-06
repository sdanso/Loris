/* exported FormElement, SelectElement, TextareaElement, TextboxElement, DateElement,
NumericElement, FileElement, StaticElement, ButtonElement, LorisElement
*/

/**
 * This file contains React components for Loris form elements.
 *
 * @author Loris Team
 * @version 1.0.0
 *
 */

/**
 * Form Component.
 * React wrapper for <form> element that accepts children react components
 *
 * The form elements can be passed in two ways:
 * 1. A `this.props.formElements` JSON object
 * 2. Form components nested directly inside <FormElement></FormElement>
 *
 * Note that if both are passed `this.props.formElements` is displayed first.
 *
 */
var FormElement = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    method: React.PropTypes.oneOf(['POST', 'GET']),
    action: React.PropTypes.string,
    class: React.PropTypes.string,
    columns: React.PropTypes.number,
    formElements: React.PropTypes.shape({
      elementName: React.PropTypes.shape({
        name: React.PropTypes.string,
        type: React.PropTypes.string
      })
    }),
    onSubmit: React.PropTypes.func,
    onUserInput: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      name: null,
      id: null,
      method: 'POST',
      action: undefined,
      class: 'form-horizontal',
      columns: 1,
      fileUpload: false,
      formElements: {},
      onSubmit: function() {
        console.warn('onSubmit() callback is not set!');
      }
    };
  },
  getFormElements: function() {
    const formElementsHTML = [];
    const columns = this.props.columns;
    const maxColumnSize = 12;
    const colSize = Math.floor(maxColumnSize / columns);
    const colClass = "col-xs-12 col-sm-" + colSize + " col-md-" + colSize;

    // Render elements from JSON
    const filter = this.props.formElements;

    Object.keys(filter).forEach(function(objKey, index) {
      const userInput = this.props.onUserInput ? this.props.onUserInput : filter[objKey].onUserInput;
      const value = filter[objKey].value ? filter[objKey].value : '';
      formElementsHTML.push(
        <div key={'el_' + index} className={colClass}>
          <LorisElement
            element={filter[objKey]}
            onUserInput={userInput}
            value={value}
          />
        </div>
      );
    }.bind(this));

    // Render elements from React
    React.Children.forEach(this.props.children, function(child, key) {
      // If child is plain HTML, insert it as full size.
      // Useful for inserting <hr> to split form sections
      var elementClass = "col-xs-12 col-sm-12 col-md-12";

      // If child is form element use appropriate size
      if (React.isValidElement(child) && typeof child.type === "function") {
        elementClass = colClass;
      }
      formElementsHTML.push(
        <div key={'el_child_' + key} className={elementClass}>{child}</div>
      );
    });

    return formElementsHTML;
  },
  handleSubmit: function(e) {
    // Override default submit if property is set
    if (this.props.onSubmit) {
      e.preventDefault();
      this.props.onSubmit(e);
    }
  },
  render: function() {
    var encType = this.props.fileUpload ? 'multipart/form-data' : null;

    // Generate form elements
    var formElements = this.getFormElements();

    // Flexbox is set to ensure that columns of different heights
    // are displayed proportionally on the screen
    var rowStyles = {
      display: "flex",
      flexWrap: "wrap"
    };

    return (
      <form
        name={this.props.name}
        id={this.props.id}
        className={this.props.class}
        method={this.props.method}
        action={this.props.action}
        encType={encType}
        onSubmit={this.handleSubmit}
      >
        <div className="row" style={rowStyles}>
          {formElements}
        </div>
      </form>
    );
  }
});

/**
 * Select Component
 * React wrapper for a simple or 'multiple' <select> element.
 */
var SelectElement = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    options: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.array
    ]),
    id: React.PropTypes.string,
    class: React.PropTypes.string,
    multiple: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    emptyOption: React.PropTypes.bool,
    hasError: React.PropTypes.bool,
    errorMessage: React.PropTypes.string,
    onUserInput: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      name: '',
      options: {},
      label: '',
      value: undefined,
      id: '',
      class: '',
      multiple: false,
      disabled: false,
      required: false,
      emptyOption: true,
      hasError: false,
      errorMessage: 'The field is required!',
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },

  handleChange: function(e) {
    var value = e.target.value;
    var options = e.target.options;

    // Multiple values
    if (this.props.multiple && options.length > 1) {
      value = [];
      for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
    }

    this.props.onUserInput(this.props.name, value);
  },
  render: function() {
    var multiple = this.props.multiple ? 'multiple' : null;
    var required = this.props.required ? 'required' : null;
    var disabled = this.props.disabled ? 'disabled' : null;
    var options = this.props.options;
    var errorMessage = null;
    var emptyOptionHTML = null;
    var requiredHTML = null;
    var elementClass = 'row form-group';

    // Add required asterix
    if (required) {
      requiredHTML = <span className="text-danger">*</span>;
    }

    // Add empty option
    if (this.props.emptyOption) {
      emptyOptionHTML = <option></option>;
    }

    // Add error message
    if (this.props.hasError || (this.props.required && this.props.value === "")) {
      errorMessage = <span>{this.props.errorMessage}</span>;
      elementClass = 'row form-group has-error';
    }

    // Default to empty string for regular select and to empty array for 'multiple' select
    const value = this.props.value || (multiple ? [] : "");

    return (
      <div className={elementClass}>
        <label className="col-sm-3 control-label" htmlFor={this.props.label}>
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <select
            name={this.props.name}
            multiple={multiple}
            className="form-control"
            id={this.props.label}
            value={value}
            onChange={this.handleChange}
            required={required}
            disabled={disabled}
          >
            {emptyOptionHTML}
            {Object.keys(options).map(function(option) {
              return (
                <option value={option} key={option}>{options[option]}</option>
              );
            })}
          </select>
          {errorMessage}
        </div>
      </div>
    );
  }
});

/**
 * Textarea Component
 * React wrapper for a <textarea> element.
 */
var TextareaElement = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    id: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    rows: React.PropTypes.number,
    cols: React.PropTypes.number,
    onUserInput: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      name: '',
      label: '',
      value: '',
      id: null,
      disabled: false,
      required: false,
      rows: 4,
      cols: 25,
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleChange: function(e) {
    this.props.onUserInput(this.props.name, e.target.value);
  },
  render: function() {
    var disabled = this.props.disabled ? 'disabled' : null;
    var required = this.props.required ? 'required' : null;
    var requiredHTML = null;

    // Add required asterix
    if (required) {
      requiredHTML = <span className="text-danger">*</span>;
    }

    return (
      <div className="row form-group">
        <label className="col-sm-3 control-label" htmlFor={this.props.id}>
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <textarea
            cols={this.props.cols}
            rows={this.props.rows}
            className="form-control"
            name={this.props.name}
            id={this.props.id}
            value={this.props.value || ""}
            required={required}
            disabled={disabled}
            onChange={this.handleChange}
          >
          </textarea>
        </div>
      </div>
    );
  }
});

/**
 * Textbox Component
 * React wrapper for a <input type="text"> element.
 */
var TextboxElement = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    id: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    onUserInput: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      name: '',
      label: '',
      value: '',
      id: null,
      disabled: false,
      required: false,
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleChange: function(e) {
    this.props.onUserInput(this.props.name, e.target.value);
  },
  render: function() {
    var disabled = this.props.disabled ? 'disabled' : null;
    var required = this.props.required ? 'required' : null;
    var requiredHTML = null;

    // Add required asterix
    if (required) {
      requiredHTML = <span className="text-danger">*</span>;
    }

    return (
      <div className="row form-group">
        <label className="col-sm-3 control-label" htmlFor={this.props.id}>
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <input
            type="text"
            className="form-control"
            name={this.props.name}
            id={this.props.id}
            value={this.props.value || ""}
            required={required}
            disabled={disabled}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
});

/**
 * Date Component
 * React wrapper for a <input type="date"> element.
 */
var DateElement = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    id: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    onUserInput: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      name: '',
      label: '',
      value: '',
      id: null,
      disabled: false,
      required: false,
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleChange: function(e) {
    this.props.onUserInput(this.props.name, e.target.value);
  },
  render: function() {
    var disabled = this.props.disabled ? 'disabled' : null;
    var required = this.props.required ? 'required' : null;
    var requiredHTML = null;

    // Add required asterix
    if (required) {
      requiredHTML = <span className="text-danger">*</span>;
    }

    return (
      <div className="row form-group">
        <label className="col-sm-3 control-label" htmlFor={this.props.label}>
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <input
            type="date"
            className="form-control"
            name={this.props.name}
            id={this.props.label}
            min={this.props.minYear}
            max={this.props.maxYear}
            onChange={this.handleChange}
            value={this.props.value}
            required={required}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
});

/**
 * Numeric Component
 * React wrapper for a <input type="number"> element.
 */
var NumericElement = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    min: React.PropTypes.number.isRequired,
    max: React.PropTypes.number.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    id: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    onUserInput: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      name: '',
      min: null,
      max: null,
      label: '',
      value: '',
      id: null,
      required: false,
      disabled: false,
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleChange: function(e) {
    this.props.onUserInput(this.props.name, e.target.value);
  },
  render: function() {
    var disabled = this.props.disabled ? 'disabled' : null;
    var required = this.props.required ? 'required' : null;
    var requiredHTML = null;

    return (
      <div className="row form-group">
        <label className="col-sm-3 control-label" htmlFor={this.props.id}>
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <input
            type="number"
            className="form-control"
            name={this.props.name}
            id={this.props.id}
            min={this.props.min}
            max={this.props.max}
            value={this.props.value}
            disabled={disabled}
            required={required}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
});

/**
 * File Component
 * React wrapper for a simple or 'multiple' <select> element.
 */
var FileElement = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]),
    id: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    required: React.PropTypes.bool,
    hasError: React.PropTypes.bool,
    errorMessage: React.PropTypes.string,
    onUserInput: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      name: '',
      label: 'File to Upload',
      value: '',
      id: null,
      disabled: false,
      required: false,
      hasError: false,
      errorMessage: 'The field is required!',
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleChange: function(e) {
    // Send current file to parent component
    const file = e.target.files[0] ? e.target.files[0] : '';
    this.props.onUserInput(this.props.name, file);
  },

  render: function() {
    const required = this.props.required ? 'required' : null;
    const fileName = this.props.value ? this.props.value.name : undefined;
    let requiredHTML = null;
    let errorMessage = '';
    let elementClass = 'row form-group';

    // Add required asterix
    if (required) {
      requiredHTML = <span className="text-danger">*</span>;
    }

    const truncateEllipsis = {
      display: 'table',
      tableLayout: 'fixed',
      width: '100%',
      whiteSpace: 'nowrap'
    };

    const truncateEllipsisChild = {
      display: 'table-cell',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };

    // Add error message
    if (this.props.hasError) {
      errorMessage = this.props.errorMessage;
      elementClass = 'row form-group has-error';
    }

    // Need to manually reset file value, because HTML API
    // does not allow setting value to anything than empty string.
    // Hence can't use value attribute in the input element.
    const fileHTML = document.querySelector(".fileUpload");
    if (fileHTML && !fileName) {
      fileHTML.value = "";
    }

    if (this.props.disabled) {
      // add padding to align video title on disabled field
      truncateEllipsis.paddingTop = "7px";
      return (
        <div className={elementClass}>
          <label className="col-sm-3 control-label">
            {this.props.label}
          </label>
          <div className="col-sm-9">
            <div style={truncateEllipsis}>
              <span style={truncateEllipsisChild}>{fileName}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={elementClass}>
        <label className="col-sm-3 control-label">
          {this.props.label}
          {requiredHTML}
        </label>
        <div className="col-sm-9">
          <div className="input-group">
            <div tabIndex="-1"
                 className="form-control file-caption kv-fileinput-caption">
              <div style={truncateEllipsis}>
                <span style={truncateEllipsisChild}>{fileName}</span>
              </div>
              <div className="file-caption-name" id="video_file"></div>
            </div>
            <div className="input-group-btn">
              <div className="btn btn-primary btn-file">
                <i className="glyphicon glyphicon-folder-open"></i> Browse
                <input
                  type="file"
                  className="fileUpload"
                  name={this.props.name}
                  onChange={this.handleChange}
                  required={required}
                />
              </div>
            </div>
          </div>
          <span>{errorMessage}</span>
        </div>
      </div>
    );
  }
});

/**
 * Static element component.
 * Used to displays plain/formatted text as part of a form
 *
 * To pass a formatted text, you need to wrap it in a single parent element.
 * Example usage:
 *
 * ```
 * var myText = (<span>This is my <b>text</b></span>);
 * <StaticElement
 *    text={myText}
 *    label={note}
 * />
 * ```
 */
var StaticElement = React.createClass({

  mixins: [React.addons.PureRenderMixin],
  propTypes: {
    label: React.PropTypes.string,
    text: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ])
  },

  getDefaultProps: function() {
    return {
      label: '',
      text: null
    };
  },

  render: function() {
    return (
      <div className="row form-group">
        <label className="col-sm-3 control-label">
          {this.props.label}
        </label>
        <div className="col-sm-9">
          <p className="form-control-static">{this.props.text}</p>
        </div>
      </div>
    );
  }
});

/**
 * Button component
 * React wrapper for <button> element, typically used to submit forms
 */
var ButtonElement = React.createClass({
  propTypes: {
    label: React.PropTypes.string,
    type: React.PropTypes.string,
    onUserInput: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      label: 'Submit',
      type: 'submit',
      buttonClass: 'btn btn-primary',
      columnSize: 'col-sm-9 col-sm-offset-3',
      onUserInput: function() {
        console.warn('onUserInput() callback is not set');
      }
    };
  },
  handleClick: function(e) {
    this.props.onUserInput(e);
  },
  render: function() {
    return (
      <div className="row form-group">
        <div className={this.props.columnSize}>
          <button
            type={this.props.type}
            className={this.props.buttonClass}
            onClick={this.handleClick}
          >
            {this.props.label}
          </button>
        </div>
      </div>
    );
  }
});

/**
 * Generic form element.
 */
var LorisElement = React.createClass({

  render: function() {
    var elementProps = this.props.element;
    elementProps.ref = elementProps.name;
    elementProps.onUserInput = this.props.onUserInput;

    var elementHtml = <div></div>;

    switch (elementProps.type) {
      case 'text':
        elementHtml = (<TextboxElement {...elementProps} />);
        break;
      case 'select':
        elementHtml = (<SelectElement {...elementProps} />);
        break;
      case 'date':
        elementHtml = (<DateElement {...elementProps} />);
        break;
      case 'numeric':
        elementHtml = (<NumericElement {...elementProps} />);
        break;
      case 'textarea':
        elementHtml = (<TextareaElement {...elementProps} />);
        break;
      case 'file':
        elementHtml = (<FileElement {...elementProps} />);
        break;
      case 'static':
        elementHtml = (<StaticElement {...elementProps} />);
        break;
      default:
        console.warn(
          "Element of type " + elementProps.type + " is not currently implemented!"
        );
        break;
    }

    return elementHtml;
  }
});

window.FormElement = FormElement;
window.SelectElement = SelectElement;
window.TextareaElement = TextareaElement;
window.TextboxElement = TextboxElement;
window.DateElement = DateElement;
window.NumericElement = NumericElement;
window.FileElement = FileElement;
window.StaticElement = StaticElement;
window.ButtonElement = ButtonElement;
window.LorisElement = LorisElement;

export default {
  FormElement,
  SelectElement,
  TextareaElement,
  TextboxElement,
  DateElement,
  NumericElement,
  FileElement,
  StaticElement,
  ButtonElement,
  LorisElement
};
