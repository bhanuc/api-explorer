import './BaseStyles.css'
import './Application.css'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Dock from 'react-dock'
import marked from 'marked'
import { ExplorerHeader, ApplicationLoading, ApplicationAskForAPI, LateralMenu, APICounter } from 'components'
import { selectedOperation } from '../actions/loadActionCreators'

class Application extends Component {
  constructor () {
    super()
    this.state = { dockSize: 350, dockIsVisible: true }
  }

  render () {
    if (this.props.loader.get('totalApis') === 0) {
      return this.renderAskForSpec()
    }
    const loaded = this.props.loader.get('loaded')
    return loaded ? this.renderApplication() : this.renderLoadingScreen()
  }

  renderLoadingScreen () {
    const { currentStep, progress } = this.props.loader.toJS()
    return (
      <ApplicationLoading currentStep={currentStep} progressMessages={progress} />
    )
  }

  renderAskForSpec () {
    return <ApplicationAskForAPI />
  }

  handleDockResize (size) {
    this.setState({ dockSize: size, dockIsVisible: true })
  }

  handleCloseDock () {
    this.setState({ dockSize: 0, dockIsVisible: false })
  }

  renderApplication () {
    const numberOfAPIs = this.props.apis.get('byOrder').size
    return (
      <div id='content'>
        <Dock isVisible={this.state.dockIsVisible} onSizeChange={size => this.handleDockResize(size)} fluid={false} defaultSize={350} size={this.state.dockSize} dimMode='none' dockStyle={{backgroundColor: '#222'}} >
          <div id='sidebar'>
            <span className='pull-right close-button' onClick={() => this.handleCloseDock()} >X</span>
            <div className='api-explorer-logo'>
              <Link to='/' >
              <img src='https://dev.int.skystore.com/api/explorer/public/images/logo_transparent.png' />
              </Link>
            </div>
            <ul className='nav' id='side-menu'>
              <li>
                <Link to='/' >
                <i className='fa fa-fw fa-home'></i><span>Home</span>
                </Link>
              </li>
            </ul>

            <LateralMenu
              operations={this.props.operations.toJS()}
              apis={this.props.apis}
              selectedOperationId={this.props.selectedOperationId}
              onOperationClick={ operationId => this.props.dispatch(selectedOperation(operationId)) }
            />
          </div>
        </Dock>
        <div id='main-content' style={{ marginLeft: this.state.dockSize }}>
          <div className='container-fluid'>
            <div className='row' id='top'>
              <div className='col-lg-12'>
                <h1>API Explorer {numberOfAPIs > 1 && <APICounter numberOfAPIs={numberOfAPIs} />}</h1>
                {this.props.children}

                <div id='fixed-footer'>
                  Copyright &copy; API Explorer 2015

                  <Link to='/settings' className='pull-right'>
                    <i className='fa fa-cog fa-inverse' /> Settings
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderMultipleAPIContent (apis) {
    const apisArray = this.props.apis.get('byOrder').map(a => this.props.apis.get('byName').get(a)).toArray()
    return (
      <div>
        {apisArray.map(api => this.renderSingleAPIContent(api))}
      </div>
    )
  }

  renderSingleAPIContent (api) {
    const { title, description, version } = api.info
    return (
      <div key={title}>
        <ExplorerHeader api={{ apiName: title, apiVersion: version, productVersion: version }} />
        <p dangerouslySetInnerHTML={this.getHtmlDescription(description)} />
      </div>
    )
  }

  getHtmlDescription (description) {
    return { __html: marked(description || '') }
  }

}

Application.propTypes = {
  children: PropTypes.element,
  loader: PropTypes.object,
  apis: PropTypes.object,
  operations: PropTypes.object,
  dispatch: PropTypes.func,
  selectedOperationId: PropTypes.string
}

export default connect(
  state => {
    const selectedOperationId = state.uiState ? state.uiState.get('selectedOperationId') : ''
    return {
      loader: state.loader,
      apis: state.apis,
      operations: state.operations,
      selectedOperationId: selectedOperationId
    }
  }
)(Application)
