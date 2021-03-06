# Midas Web App 

It is a Single-Page App (SPA) written in standard web technologies [HTML5](http://whatwg.org/html), [SCSS](http://sass-lang.com) and [TypeScript](http://www.typescriptlang.org). It leverages the popular [Angular](https://angular.io/) framework and [Angular Material](https://material.angular.io/) for material design components.


## Getting started

1. Ensure you have the following installed in your system:

    [`git`](https://git-scm.com/downloads)

    [`npm`](https://nodejs.org/en/download/)

2. Install [angular-cli](https://github.com/angular/angular-cli) globally.
```
npm install -g @angular/cli@9.1.12
```

3. Clone the project locally into your system.
```
git clone https://github.com/MidasHub/webapp_angular9.git
```

4. `cd` into project root directory and make sure you are on the master branch.

5. Install the dependencies.
```
npm install
```

6. To preview the app, run the following command and navigate to `http://localhost:4200/`.
```
ng serve
```

The application is using the development server with basic authentication by default. The credentials for the same are:
 
    Username - mifos or midas
    Password - password

**Important Note:** Please do not make any alterations to these credentials.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).


## Setting up a local server

Follow the given instructions for your operating system to setup a local server for the Midas platform.

[Windows](https://cwiki.apache.org/confluence/display/FINERACT/Fineract-platform+Installation+on+Windows)

[Ubuntu](https://cwiki.apache.org/confluence/display/FINERACT/Fineract+Installation+on+Ubuntu+Server)

For connecting to server running elsewhere update the base API URL and/or tenant identifier property in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

By default OAuth2 is disabled. To enable it, change the value of oauth.enabled property to true in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

### Translate

Name: 

      - label đặt tên là lbl+[tên biến]
      - button đặt tên là btn+[tên biến]
      - message đặt lên là msg+[Tên biến]

### Alert standard
Use "Alert Interface" for popup Alert Msg
  Alert {
    type?: string; 
    message: string;
    msgClass?: string; --> user for string value: cssSuccess, cssInfo, cssDanger, cssWarning
    msgDuration?: number --> default: 3000ms
    hPosition?: any ; --> default: left
    vPosition?: any;--> default: top
    }

### Auto deployment pipeline with Github Actions
  - **Step 1:** Make a github runner as mentioned here : https://docs.github.com/en/free-pro-team@latest/actions/hosting-your-own-runners/adding-self-hosted-runners
  - **Step 2:** make a deployment YML file in .github/workflows directory of the project.
      Example: *the deployment YML file for clone source code, install dependencies and build Angular 9 project to path: /usr/share/nginx/html/staging/*
      ```
          on:
            push:
              branches: [ staging, master]   

          name: Midas_UI_staging_deploy

          jobs:
            deployStaging:
              if: ${{ github.event_name == 'push' && github.event.ref =='refs/heads/staging' }}
              runs-on: self-hosted
              steps:
              # checkout branch
              - name: pull source from staging branch
                run: |
                  git pull origin staging
              - name: install dependency
                run: |
                  yarn install
              - name: build production
                run: |
                  ng build --prod --output-hashing=all --base-href="/"  --serviceWorker=true --deleteOutputPath=true --outputPath="/usr/share/nginx/html/staging/" 
      ```
  - **Step 3:** Submit the deployment YML file to Github and done
