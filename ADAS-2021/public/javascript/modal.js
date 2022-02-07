/**
 * Closes the modal if clicked off.
 * @param {click} event - Click event
 */
window.onclick = function(event) {
    if (event.target.id == "backdrop") this.closeModal();
}

/**
 * Checks to see if a modal needs to be closed if one is open and the window size becomes too small.
 */
window.onresize = function() {
    let notifModal = document.getElementById("notificationModal");
    let thresholdModal = document.getElementById("thresholdModal");
    let errorModal = document.getElementById("errorModal");

    if ($(window).width() < 575 && (notifModal.style.display == "initial" ||
    thresholdModal.style.display == "initial")) {
        notifModal.style.display = "none";
        thresholdModal.style.display = "none";
        errorModal.style.display = "initial";
    }
}

/**
 * Opens the appropriate modal depending on which button was clicked.
 * @param {button} btn The respective modal's button.
 */
function openModal(btn) {
    if ($(window).width() < 575) {
        document.getElementById("errorModal").style.display = "initial";
    } else {
        if (btn.id == "openNotifModalBtn") {
            document.getElementById("notificationModal").style.display = "initial";
        } else if (btn.id == "openThresholdModalBtn") {
            document.getElementById("thresholdModal").style.display = "initial";
        }
    }
    document.getElementById("backdrop").style.display = "initial";
}

/**
 * Closes the currently open modal.
 */
function closeModal() {
    if (document.getElementById("notificationModal").style.display == "initial"){
        document.getElementById("notificationModal").style.display = "none";
    } else if (document.getElementById("thresholdModal").style.display == "initial"){
        document.getElementById("thresholdModal").style.display = "none";
    } else {
        document.getElementById("errorModal").style.display = "none";
    }
    document.getElementById("backdrop").style.display = "none";
}

/**
 * Verifies input for the Threshold modal.
 */
function verifyThreshold(){

    const VALID_INPUT = /^\d+$/;
    const THRESHOLD_ERR = document.getElementById("thresholdError");
    const ERR_MSG = document.getElementById("thresholdErrMsg");
    const MAX_THRESHOLD = 5;

    let values = [];

    for (let i = 1; i < MAX_THRESHOLD; i++){
        let string = document.getElementById("threshold" + i).value;
        if (string == ""){
            ERR_MSG.innerHTML = "Thresholds cannot be left blank.";
            THRESHOLD_ERR.style.opacity = "1";
            return false;
        }
    }

    for (let i = 1; i < MAX_THRESHOLD; i++){
        let value = parseInt(document.getElementById("threshold" + i).value);
        if (!VALID_INPUT.test(value) 
                || !Number.isSafeInteger(parseInt(value)) 
                || isNaN(parseInt(value))) {
            ERR_MSG.innerHTML = "Thresholds can only be positive integers.";
            THRESHOLD_ERR.style.opacity = "1";
            return false;
        } else values[values.length] = value;
    }

    if (values[0] < 1) {
        ERR_MSG.innerHTML = "Thresholds cannot be negative or 0.";
        THRESHOLD_ERR.style.opacity = "1";
        return false;
    }

    if (values[0] < values[1] && values[1] < values[2] && values[2] < values[3]) {
        THRESHOLD_ERR.style.opacity = "0";
        return true;
    } else {
        ERR_MSG.innerHTML = "Thresholds must be incremental.";
        THRESHOLD_ERR.style.opacity = "1";
        return false;
    }
}

/**
 * Verifies input for the Email notification modal.
 */
function verifyNotification(){
    const VALID_NAME = /^[a-z]{1,20}$/i;
    const VALID_PHONE = /^[0-9]{10}$/g;

    const ERR_ELEM = document.getElementById("notifError");
    const ERR_MSG = document.getElementById("notifErrMsg");

    let email = document.getElementById("emailToAdd").value;
    let fName = document.getElementById("fName").value;
    let lName = document.getElementById("lName").value;
    let phone = document.getElementById("phone").value;

    if (fName == "" || lName == "" || email == "" || phone == "") {
        ERR_ELEM.style.opacity = 1;
        ERR_MSG.innerHTML = "No fields can be left blank.";
        return false;
    }
    if (!VALID_NAME.test(fName)) {
        ERR_ELEM.style.opacity = 1;
        ERR_MSG.innerHTML = "Invalid first name. Letters only.";
        return false;
    }
    if (!VALID_NAME.test(lName)) {
        ERR_ELEM.style.opacity = 1;
        ERR_MSG.innerHTML = "Invalid last name. Letters only.";
        return false;
    }
    if (!VALID_PHONE.test(phone)) {
        ERR_ELEM.style.opacity = 1;
        ERR_MSG.innerHTML = "Invalid phone number. Exactly 10 digits only.";
        return false;
    } else return isValidEmail(email) && true;

}

/**
 * Checks the validity of an email address.
 * @param {string} email The email to validate.
 */
function isValidEmail(email){
    const VALID_EMAIL = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const ERR_ELEM = document.getElementById("notifError");
    const ERR_MSG = document.getElementById("notifErrMsg");

    if (!VALID_EMAIL.test(email) || email == '') {
        ERR_ELEM.style.opacity = 1;
        ERR_MSG.innerHTML = "Invalid email. Format: test@example.com.";
        return false;
    } else return true;
}

/**
 * Clears input of the modal when it closes and removes any error messages from previous input.
 */
function clearInput() {
    if (document.getElementById("notificationModal").style.display == "initial") {
        document.getElementById("fName").value = "";
        document.getElementById("lName").value = "";
        document.getElementById("emailToAdd").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("emailToRemove").value = "";
        document.getElementById("notifError").style.opacity = 0;
    } else if (document.getElementById("thresholdModal").style.display == "initial"){
        const MAX_THRESHOLD = 5;
        for (let i = 1; i < MAX_THRESHOLD; i++) {
            document.getElementById("threshold" + i).value = "";
        }
        document.getElementById("thresholdError").style.opacity = "0";
    }
}

/**
 * Swaps between the displays for entering email addresses and removing them.
 * @param {boolean} closing True if the modal is closed via the 'X.'
 */
function swapEmailForm(closing){
    const ALL_INPUTS = document.getElementById("addEmailForm");
    const REMOVE_BTN = document.getElementById("removeEmailForm");
    const SWAP_BTN = document.getElementById("swapFormBtn");
    const TITLE = document.getElementById("notifModalTitle");

    document.getElementById("notifError").style.opacity = 0;

    if (closing){
        TITLE.innerHTML = "Receive Notifications";
        ALL_INPUTS.style.display = "initial";
        REMOVE_BTN.style.display = "none";
        SWAP_BTN.innerHTML = "Turn Off Notifications";
        SWAP_BTN.classList.add("btn-warning");
        SWAP_BTN.classList.remove("btn-success");
    } else {
        if (ALL_INPUTS.style.display == "initial" || ALL_INPUTS.style.display == ""){
            TITLE.innerHTML = "Disable Notifications";
            ALL_INPUTS.style.display = "none";
            REMOVE_BTN.style.display = "initial";
            SWAP_BTN.innerHTML = "Receive Notifications";
            SWAP_BTN.classList.remove("btn-warning");
            SWAP_BTN.classList.add("btn-success");
        } else{
            TITLE.innerHTML = "Receive Notifications";
            ALL_INPUTS.style.display = "initial";
            REMOVE_BTN.style.display = "none";
            SWAP_BTN.innerHTML = "Turn Off Notifications";
            SWAP_BTN.classList.add("btn-warning");
            SWAP_BTN.classList.remove("btn-success");
        }
    }
}

/**
 * Swaps between the displays for changing thresholds and viewing the current values.
 * @param {boolean} closing True if the modal is closed via the 'X.'
 * @param {HTMLButtonElement} btn The button that was pressed.
 */
function swapThresholdForm(closing, btn){
    const ALL_INPUTS = document.getElementById("updateThresholdForm");
    const VIEW_THRESHOLDS_BTN = document.getElementById("viewThresholdsBtn");
    const TITLE = document.getElementById("thresholdModalTitle");
    const THRESHOLDS_TABLE = document.getElementById("thresholdsTableDiv");

    document.getElementById("thresholdError").style.opacity = 0;

    if (closing){
        ALL_INPUTS.style.display = "initial";
        VIEW_THRESHOLDS_BTN.innerHTML = "View Current Thresholds";
        TITLE.innerHTML = "Set Thresholds";
        THRESHOLDS_TABLE.style.display = "none";
    }
    else{
        if (TITLE.innerHTML == "Set Thresholds"){
            TITLE.innerHTML = "View Thresholds";
            ALL_INPUTS.style.display = "none";
            VIEW_THRESHOLDS_BTN.innerHTML = "Edit Threshold Entries";
            THRESHOLDS_TABLE.style.display = "initial";
        } else if (TITLE.innerHTML == "View Thresholds"){
            TITLE.innerHTML = "Set Thresholds";
            ALL_INPUTS.style.display = "initial";
            VIEW_THRESHOLDS_BTN.innerHTML = "View Current Thresholds";
            THRESHOLDS_TABLE.style.display = "none";
        }
    }
}