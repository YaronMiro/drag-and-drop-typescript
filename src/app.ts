
// ********************************* //
//   Interface - ProjectInput
// ********************************* //
interface ProjectInputInterface {
    templateID: string,
    hostElementID: string,
    templateElement?: HTMLTemplateElement,
    hostElement?: HTMLElement,
}


// ********************************* //
//   Class - ProjectInput
// ********************************* //
class ProjectInput implements ProjectInputInterface {
    templateID = "";
    hostElementID = "";
    templateElement;
    hostElement;

    constructor(templateID: string, hostElementID: string){
        this.templateID = templateID;
        this.hostElementID = hostElementID;
        const templateElement = document.getElementById(this.templateID);
        const hostElement = document.getElementById(this.hostElementID);

        // In case we have no templates than exit early.
        if (!templateElement || !hostElement) {
            throw new Error("Id does not exists on DOM")
        }

        this.templateElement = templateElement as HTMLTemplateElement;
        this.hostElement = hostElement;

        // Get the template element content.
        const templateCloneElement = document.importNode(this.templateElement.content ,true);
        const element = templateCloneElement.firstElementChild as HTMLElement;

        // Render to the DOM.
        this.renderProjectInput(element);
    }
    
    private renderProjectInput(element: HTMLElement){
        // Append the cloned template content into the host element.
         this.hostElement.insertAdjacentElement("afterbegin", element);
    }

}

new ProjectInput('project-input','app');

 
// document.body.appendChild(clon);}  