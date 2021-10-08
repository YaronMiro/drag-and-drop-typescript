
enum ProjectStatus {
    ACTIVE = "active",
    DONE = "done",
}

const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}


type HTMLElementID = string;

interface Project {
    title: string;
    description: string;
    people: number;
}


 abstract class BaseTemplateElement {
    protected hostElement: HTMLElement;
    protected templateElement: HTMLElement;

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID){
        
        // Verify we have the target "template" element.
        const template = <HTMLTemplateElement> document.getElementById(templateElementID);
        if (!template) {
            throw new Error(`Template ${templateElementID} ID does not exists on DOM!`);
        }

        this.templateElement = <HTMLElement> document.importNode(template.content ,true).firstElementChild;

        // Verify we have the target "host" element.
        const hostElement = document.getElementById(hostElementID);
        if (!hostElement) {
            throw new Error(`Host element ${hostElement} ID does not exists on DOM!`);
        }
        
        this.hostElement = hostElement;
    }

    abstract renderElement(): void
}


class App {

    constructor(private elements: BaseTemplateElement[] ){}

    public render(){
        // Render to the DOM.
        this.elements.forEach( element => element.renderElement());
    }

}


class ProjectInputElement extends BaseTemplateElement {
    
    private projectInputFormElement: HTMLFormElement;
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;

    private projectInputData: Project = {
        title: '',
        description: '',
        people: 0,
    }

    constructor(templateElementID: HTMLElementID, hostElementID: HTMLElementID){

        // Run Parent logic;
        super(templateElementID, hostElementID);

        // Get the template element content.
        this.projectInputFormElement = <HTMLFormElement>this.templateElement;

        this.titleInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement> this.projectInputFormElement.querySelector('#people');
        
        this.init();
    }

    @Autobind
    private submitHandler(event: Event){
        event.preventDefault();
        this.getProjectInputData();
    }

    private getProjectInputData() {

        this.projectInputData = {
            title: this.titleInputElement.value,
            description: this.descriptionInputElement.value,
            people: +this.peopleInputElement.value,
        };

        console.log(this.projectInputData);
    }

    renderElement() {
        this.projectInputFormElement.id = 'user-input';
        this.hostElement.insertAdjacentElement('afterbegin',  this.projectInputFormElement);
    }

    private init() {
       this.hostElement.addEventListener('submit', this.submitHandler);
    }

}

class ProjectListElement extends BaseTemplateElement {
    
    projectListElement: HTMLElement;
    private listType: ProjectStatus;

    constructor(
        templateElementID: HTMLElementID, hostElementID: HTMLElementID, listType: ProjectStatus){

        // Run Parent logic;
        super(templateElementID, hostElementID);

        // Get the template element content.
        this.projectListElement = <HTMLFormElement>this.templateElement;
        this.listType = listType;

    }

    renderElement() {
        // Append the cloned template content into the host element.
        this.projectListElement.id = `${this.listType}-projects`;
        this.hostElement.insertAdjacentElement('beforeend', this.projectListElement);
    }

}

const app = new App([
    new ProjectInputElement('project-input','app'),
    new ProjectListElement('project-list','app', ProjectStatus.ACTIVE),
    new ProjectListElement('project-list','app', ProjectStatus.DONE),
]);

app.render();