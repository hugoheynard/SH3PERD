import {Form} from "../frontElements/Forms/FormBuilder/class_Form.js";
import {Login_BackendCall} from "../backendCalls/Login_BackendCall.js";
import {FormField_textInput} from "../frontElements/Forms/FormBuilder/Fields/class_FormField_TextInput.js";
import {postLoginProcess} from "./postLoginProcess.js";

export const loginForm = new Form({
    id: 'loginForm',
    css: '',
    submitAction: Login_BackendCall.login,
    followUpAction: postLoginProcess
});

const sectionStyle = {
    global: 'col gapLarge',
    header: 'row spaceBetween',
    title: 'form_sectionTitle',
    container: 'formSection'
};

loginForm.addSection({
    id:'login',
    positionInForm: 1,
    element: {
        title:'',
        style: sectionStyle
    }
})

loginForm.addField(
    {
        section:'login',
        positionInSection: 1,
        element:new FormField_textInput(
            {
                id: 'email',
                css: 'field textField widthLarge avg',
                require: false,
                placeholderContent: 'email'
            }
        )
    }
);

loginForm.addField(
    {
        section:'login',
        positionInSection: 2,
        element:new FormField_textInput(
            {
                id: 'password',
                css: 'field textField widthLarge avg ',
                require: false,
                placeholderContent: 'password'
            }
        )
    }
);

loginForm.add_submitButton('Join the herd');