// ********************************* //
//   Class - ProjectInput
// ********************************* //

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLElement;
    projectInputFormElement: HTMLFormElement;

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(templateElementID: string = "", hostElementID: string = ""){

        this.templateElement = document.getElementById(templateElementID) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementID)!;

        // Get the template element content.
        const templateCloneElement = document.importNode(this.templateElement.content ,true);
        this.projectInputFormElement = templateCloneElement.firstElementChild as HTMLFormElement;

        this.titleInputElement = this.projectInputFormElement.querySelector('#title')!;
        this.descriptionInputElement = this.projectInputFormElement.querySelector('#description')!;
        this.peopleInputElement = this.projectInputFormElement.querySelector('#people')!;
        
        // Render to the DOM.
        this.renderProjectInput();
    }
    
    private renderProjectInput() {
        // Append the cloned template content into the host element.
        this.projectInputFormElement.id = 'user-input';
         this.hostElement.insertAdjacentElement("afterbegin",  this.projectInputFormElement);
    }

}

new ProjectInput('project-input','app');