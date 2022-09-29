import './App.css'
import 'rsuite/dist/rsuite.min.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Spreadsheet from './components/Spreadsheet'
import { Spreadsheet as SpreadsheetModel } from './models/Spreadsheet'

const spreadsheet = SpreadsheetModel.Instance
const defaultSheet = spreadsheet.createSheet('Sheet 1')
spreadsheet.addSheet(defaultSheet)

/**
 * The root of the app, renders the spreadsheet and context menu and toast providers.
 */
function App() {
  return (
    <>
      <div id="contextmenu" />
      <Spreadsheet spreadsheet={spreadsheet} />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        newestOnTop
        hideProgressBar
        closeButton={false}
      />
    </>
  )
}

export default App
