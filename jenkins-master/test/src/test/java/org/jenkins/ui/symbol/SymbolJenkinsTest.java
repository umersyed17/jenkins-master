package org.jenkins.ui.symbol;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;

import org.junit.Rule;
import org.junit.Test;
import org.junit.jupiter.api.DisplayName;
import org.jvnet.hudson.test.JenkinsRule;
import org.jvnet.hudson.test.RealJenkinsRule;

public class SymbolJenkinsTest {
    @Rule
    public RealJenkinsRule rjr = new RealJenkinsRule().addPlugins("plugins/design-library.jpi");

    @Test
    @DisplayName("When resolving a symbol from a missing plugin, the placeholder is generated instead")
    public void missingSymbolFromPluginDefaultsToPlaceholder() throws Throwable {
        rjr.then(SymbolJenkinsTest::_missingSymbolFromPluginDefaultsToPlaceholder);
    }

    private static void _missingSymbolFromPluginDefaultsToPlaceholder(JenkinsRule j) {
        String symbol = Symbol.get(new SymbolRequest.Builder()
                                           .withName("science")
                                           .withPluginName("missing-plugin")
                                           .build()
        );
        assertThat(symbol, containsString(Symbol.PLACEHOLDER_MATCHER));
    }

    @Test
    @DisplayName("Resolving a valid symbol from an installed plugin does not return the placeholder")
    public void resolvingSymbolFromPlugin() throws Throwable {
        rjr.then(SymbolJenkinsTest::_resolvingSymbolFromPlugin);
    }

    private static void _resolvingSymbolFromPlugin(JenkinsRule j) {
        String symbol = Symbol.get(new SymbolRequest.Builder()
                                           .withName("app-bar")
                                           .withPluginName("design-library")
                                           .build()
        );
        assertThat(symbol, not(containsString(Symbol.PLACEHOLDER_MATCHER)));
    }
}
