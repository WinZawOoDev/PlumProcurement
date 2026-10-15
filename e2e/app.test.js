describe('PlumProcurement', () => {
  beforeAll(async () => { await device.launchApp() })
  beforeEach(async () => { await device.reloadReactNative() })
  it('should show Price Management and navigate tabs', async () => {
    await expect(element(by.text('Price Management'))).toBeVisible()
    // Tab labels also appear as section headers, so navigate by testID.
    await element(by.id('tab-purchasing')).tap()
    await expect(element(by.text('Record Purchase'))).toBeVisible()
    await element(by.id('tab-sellers')).tap()
    await expect(element(by.text('Add Seller'))).toBeVisible()
  })
  it('should validate price form', async () => {
    await element(by.id('tab-prices')).tap()
    await element(by.text('Add New Price')).tap()
    await expect(element(by.text('Price Entry'))).toBeVisible()
    await element(by.id('btn-Save Price')).tap()
    await expect(element(by.text('Price is required'))).toBeVisible()
  })
})
