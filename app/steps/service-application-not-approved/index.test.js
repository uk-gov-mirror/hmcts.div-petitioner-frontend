const request = require('supertest');
const { testContent, testExistence, testCustom } = require('test/util/assertions');
const { getTemplateFileLabel } = require('test/util/helpers');
const { withSession } = require('test/util/setup');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const server = require('app');
const { expect, sinon } = require('test/util/chai');

const mockServiceRefusalSession = require('test/fixtures/mockServiceRefusalSession');

const modulePath = 'app/steps/service-application-not-approved';

const content = require(`${modulePath}/content`);

let appInstance = {};
let agent = {};
let underTest = {};

let session = {};

const buildServiceRefusalSession = (extraData = {}) => {
  const oneSecond = 1000;
  return Object.assign({}, mockServiceRefusalSession, { expires: Date.now() + oneSecond }, extraData);
};

const getGeneralOrderOccurrencesInPage = response => {
  return response.text.match(new RegExp('General Order (PDF)', 'g')).length;
};

describe(modulePath, () => {
  beforeEach(() => {
    appInstance = server.init();
    agent = request.agent(appInstance.app);
    underTest = appInstance.steps.ServiceApplicationNotApproved;
  });

  afterEach(() => {
    session = {};
  });

  describe('Template Rendering', () => {
    const dataContent = {
      feeToResendApplication: '50',
      feeToEnforce: '45'
    };

    describe('Deemed service template', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession();
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for deemed service', done => {
        const deemedDataContent = Object.assign(dataContent, { serviceName: 'deemed service' });
        const exclude = [
          'serviceRefusalInfo.dispensed',
          'refusalDocumentInfo',
          'serviceApplicationLabel.dispensed',
          'files.respondentAnswers',
          'files.coRespondentAnswers',
          'files.certificateOfEntitlement',
          'files.costsOrder',
          'files.dnAnswers',
          'files.clarificationDnRefusalOrder',
          'files.rejectionDnRefusalOrder',
          'files.deemedAsServedGranted',
          'files.dispenseWithServiceGranted',
          'files.dispenseWithServiceRefused'
        ];
        testContent(done, agent, underTest, content, session, exclude, deemedDataContent, true);
      });

      it('should have one \'deemedServiceRefused\' label in template view', done => {
        const deemedServiceRefusedFileLabel = getTemplateFileLabel(content, 'deemedServiceRefused');
        testExistence(done, agent, underTest, deemedServiceRefusedFileLabel);
      });

      it('should have two \'generalOrder\' labels in template view', done => {
        // eslint-disable-next-line max-nested-callbacks
        testCustom(done, agent, underTest, [], response => {
          const numberOfItems = 2;
          expect(getGeneralOrderOccurrencesInPage(response)).to.equal(numberOfItems);
        });
      });
    });

    describe('Dispense with service template', () => {
      beforeEach(done => {
        session = buildServiceRefusalSession({ serviceApplicationType: 'dispensed', d8: [] });
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'dispenseWithServiceRefused.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          },
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'generalOrder2020-09-09.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          }
        ];
        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
      });

      it('should render the content from the content file for dispense with service', done => {
        const dispenseDataContent = Object.assign(dataContent, { serviceName: 'dispense with service' });
        const exclude = [
          'serviceRefusalInfo.deemed',
          'refusalDocumentInfo',
          'serviceApplicationLabel.deemed',
          'files.respondentAnswers',
          'files.coRespondentAnswers',
          'files.certificateOfEntitlement',
          'files.costsOrder',
          'files.dnAnswers',
          'files.clarificationDnRefusalOrder',
          'files.rejectionDnRefusalOrder',
          'files.deemedAsServedGranted',
          'files.dispenseWithServiceGranted',
          'files.deemedServiceRefused'
        ];
        testContent(done, agent, underTest, content, session, exclude, dispenseDataContent, true);
      });

      it('should have one \'dispenseWithServiceRefused\' label in template view', done => {
        const dispenseWithServiceRefusedFileLabel = getTemplateFileLabel(content, 'dispenseWithServiceRefused');
        testExistence(done, agent, underTest, dispenseWithServiceRefusedFileLabel);
      });

      it('should have one \'generalOrder\' label in template view', done => {
        const generalFileLabel = getTemplateFileLabel(content, 'generalOrder');
        testExistence(done, agent, underTest, generalFileLabel);
      });
    });
  });

  describe('Document Rendering', () => {
    beforeEach(done => {
      session = buildServiceRefusalSession();
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should return the correct list of files', () => {
      session.d8.push({
        id: '401ab79e-34cb-4570-9f2f-4cf9357m4st3r',
        createdBy: 0,
        createdOn: null,
        lastModifiedBy: 0,
        modifiedOn: null,
        fileName: 'documentNotWhiteListed1554740111371638.pdf',
        fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/30acaa2f-84d7-4e27-adb3-69551560113f',
        mimeType: null,
        status: null
      });
      const expectedDocumentsSize = 5;
      const fileTypes = underTest.getDownloadableFiles(session).map(file => {
        return file.type;
      });

      expect(fileTypes).to.have.lengthOf(expectedDocumentsSize);
      expect(fileTypes).to.include('dpetition');
      expect(fileTypes).to.include('deemedServiceRefused');
      expect(fileTypes).to.include('generalOrder');
    });
  });

  describe('Allocated court info', () => {
    let allocatedCourt = {};

    beforeEach(done => {
      session = buildServiceRefusalSession();
      allocatedCourt = session.court.serviceCentre;
      withSession(done, agent, session);
    });

    afterEach(() => {
      session = {};
    });

    it('should contain allocated court e-mail once', done => {
      testCustom(done, agent, underTest, [], response => {
        const timesEmailShouldAppearOnPage = 2;
        const emailOccurrencesInPage = response.text.match(new RegExp(allocatedCourt.email, 'g')).length;
        expect(emailOccurrencesInPage).to.equal(timesEmailShouldAppearOnPage);
      });
    });

    it('should contain allocated court phone number', done => {
      testExistence(done, agent, underTest, allocatedCourt.phoneNumber);
    });

    it('should contain allocated court opening hours', done => {
      testExistence(done, agent, underTest, allocatedCourt.openingHours);
    });
  });

  describe('Fees middleware', () => {
    it('should have updateEnforcementFeeMiddleware middleware loaded', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateEnforcementFeeMiddleware))
        .to.eql(true);
    });

    it('should have updateAppWithoutNoticeFeeFeeMiddleware middleware loaded', () => {
      expect(underTest.middleware
        .includes(applicationFeeMiddleware.updateAppWithoutNoticeFeeMiddleware))
        .to.eql(true);
    });
  });

  describe('ServiceApplicationNotApproved', () => {
    describe('#getServiceRefusalDocument', () => {
      let getCurrentContentStub = null;

      beforeEach(done => {
        session = buildServiceRefusalSession();
        getCurrentContentStub = sinon.stub(underTest, 'getCurrentContent')
          .returns(content.resources[session.language].translation.content);

        withSession(done, agent, session);
      });

      afterEach(() => {
        session = {};
        getCurrentContentStub.restore();
      });

      it('should return correct list of documents', () => {
        const expectedListSize = 5;
        const downloadableFiles = underTest.getDownloadableFiles(session);

        expect(downloadableFiles).to.have.lengthOf(expectedListSize);
        expect(downloadableFiles[0]).to.have.all.keys('uri', 'type', 'fileType');
      });

      it('should return correct service refusal document for deemed', () => {
        session.downloadableFiles = underTest.getDownloadableFiles(session);
        const { fileLabel, fileUri } = underTest.getServiceRefusalDocument(session);

        expect(fileLabel).to.eq('Deemed service refusal');
        expect(fileUri).to.have.string('deemedServiceRefused1594218147343643.pdf');
      });

      it('should return correct service refusal document for dispense with service', () => {
        session.serviceApplicationType = 'dispensed';
        session.d8 = [
          {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'dispenseWithServiceRefused.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb746d',
            mimeType: null,
            status: null
          }, {
            id: '27387e86-7fb8-4b72-8786-64ea22cb746d',
            createdBy: 0,
            createdOn: null,
            lastModifiedBy: 0,
            modifiedOn: null,
            fileName: 'd8petition1594218147343642.pdf',
            fileUrl: 'http://dm-store-aat.service.core-compute-aat.internal/documents/27387e86-7fb8-4b72-8786-64ea22cb7463',
            mimeType: null,
            status: null
          }
        ];
        session.downloadableFiles = underTest.getDownloadableFiles(session);
        const { fileLabel, fileUri } = underTest.getServiceRefusalDocument(session);

        expect(fileLabel).to.eq('Dispensed service refusal');
        expect(fileUri).to.have.string('dispenseWithServiceRefused.pdf');
      });

      it('should return empty string if no refusal document found', () => {
        const noDocumentSession = { downloadableFiles: [], serviceApplicationType: 'deemed', language: 'en' };
        const document = underTest.getServiceRefusalDocument(noDocumentSession);
        // eslint-disable-next-line no-unused-expressions
        expect(document).to.be.undefined;
      });
    });
  });
});
