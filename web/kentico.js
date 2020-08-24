function onOpenFileClick(event) {
  event.preventDefault();

  CustomElement.selectAssets({ fileType: 'all', allowMultiple: false })
  .then(([ asset ]) => CustomElement.getAssetDetails([ asset.id ]))
  .then(([ assetDetails ]) => openPDFAsset(assetDetails.url))
  .then(pdfAsset => onPDFAssetOpened(pdfAsset));
}

function initKenticoAssetSelector() {
  const button = document.getElementById('kenticoOpenFile');
  button.addEventListener('click', onOpenFileClick);
}

function openPDFAsset(pdfAsset) {
  updateLoading(true);

  return PDFViewerApplication.open(pdfAsset).then(() => pdfAsset);
}

function onPDFAssetOpened(pdfFile) {
  CustomElement.setValue(pdfFile);
  updateLoading(false);
}

function updateSize() {
  // Update the Custom element height in the Kentico Kontent UI
  const height = $("html").height();
  CustomElement.setHeight(height);
}

function updateDisabled(disabled) {
  if (disabled) {
    $('.disabled_overlay').show();
  }
  else {
    $('.disabled_overlay').hide();
  }
}

function updateLoading(loading) {
  if (loading) {
    $('.loading_overlay').show();
  }
  else {
    $('.loading_overlay').hide();
  }
}

function setup(width, height) {
  $("#outerContainer").css("width", width).css("height", height);
}

function onPDFViewerInitialized() {
  const pdfViewerInitializedEvent = new CustomEvent('pdfViewerInitialized');
  window.pdfViewerInitialized = true;
  window.dispatchEvent(pdfViewerInitializedEvent);
}

function initializePDFViewer(initialValue) {
  if ( 'pdfViewerInitialized' in window ) {
    console.log('pdfViewerInitialized');
    openPDFAsset(initialValue);
  }
  else {
    window.addEventListener('pdfViewerInitialized', () => {
      console.log('pdfViewerInitialized', { initialValue });
      if ( initialValue ) {
        openPDFAsset(initialValue);
      }
    });
  }
}

function initCustomElement() {
  initializePDFViewer();
  try {
    // Custom handlers
    initKenticoAssetSelector();
    // Custom Element
    CustomElement.init((element, _context) => {
      var width = null; // 600;
      var height = 400;

      if (element.config) {
        if (element.config.width) width = element.config.width;
        if (element.config.height) height = element.config.height;
      }

      // Setup with initial value and disabled state
      setup(width, height);
      updateDisabled(element.disabled);
      updateSize();

      initializePDFViewer(element.value);
    });
    // React when the disabled state changes (e.g. when publishing the item)
    CustomElement.onDisabledChanged(updateDisabled);
  } catch (err) {
    // Initialization with the Custom elements API failed
    // (page displayed outside of the Kentico Kontent UI)
    console.error(err);
    updateDisabled(true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCustomElement();
})
