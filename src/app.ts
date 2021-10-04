
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
    templateID = '';
    hostElementID = '';
    templateElement;
    hostElement;

    constructor(templateID: string, hostElementID: string){
        this.templateID = templateID;
        this.hostElementID = hostElementID;
        const templateElement = document.getElementById(this.templateID);
        const hostElement = document.getElementById(this.hostElementID);

        // In case we have no templates than exit early.
        if (!templateElement || !hostElement) {
            throw new Error('Id does not exists on DOM')
        }

        // Get the template element content.
        this.templateElement = <HTMLTemplateElement> templateElement;
        const templateCloneContent = this.templateElement.content.cloneNode(true);

        // Append the cloned template content into the host element.
        this.hostElement = hostElement;
        this.hostElement.appendChild(templateCloneContent);
    }

}

new ProjectInput('project-input','app');

 
// document.body.appendChild(clon);}  