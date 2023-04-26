import { result } from 'lodash-es';
import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';

class ResultView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = `We could not find that recipe. Please try another one!`;
  _message = '';
    
_generateMarkup() {
        return this._data.map(result=>previewView.render(result,false)).join('');
    }
}

export default new ResultView();
